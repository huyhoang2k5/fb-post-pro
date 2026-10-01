import axios from "axios";

export const META_GRAPH_VERSION = "v20.0";
export const META_GRAPH_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const REQUIRED_FB_SCOPES = [
  "public_profile",
  "email",
];

export interface MetaOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface MetaUserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
      is_silhouette: boolean;
    };
  };
}

export interface MetaPageItem {
  id: string;
  name: string;
  category?: string;
  access_token: string;
  tasks?: string[];
  followers_count?: number;
  fan_count?: number;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface MetaGroupItem {
  id: string;
  name: string;
  administrator?: boolean;
  member_count?: number;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookPublishOptions {
  destinationId: string;
  destinationType: "PAGE" | "GROUP";
  pageAccessToken?: string | null;
  userAccessToken: string;
  content: string;
  linkUrl?: string | null;
  contactInfo?: string | null;
  imageUrls: string[];
}

export interface PublishResult {
  success: boolean;
  fbPostId?: string;
  status: "PUBLISHED" | "FAILED" | "MANUAL_ACTION_REQUIRED";
  errorMessage?: string;
  rawResponse?: any;
}

export function getRedirectUri(reqOrigin?: string): string {
  if (process.env.FACEBOOK_REDIRECT_URI) return process.env.FACEBOOK_REDIRECT_URI;
  if (reqOrigin && !reqOrigin.includes("localhost")) {
    return `${reqOrigin}/api/facebook/callback`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/facebook/callback`;
  }
  if (process.env.NEXTAUTH_URL) return `${process.env.NEXTAUTH_URL}/api/facebook/callback`;
  // Fallback to exact production domain if on Vercel
  if (process.env.VERCEL_URL) {
    return "https://fb-post-pro.vercel.app/api/facebook/callback";
  }
  return "http://localhost:3000/api/facebook/callback";
}

/**
 * Tạo URL ủy quyền Meta OAuth
 */
export function getMetaAuthUrl(state: string = "", reqOrigin?: string): string {
  const appId = process.env.FACEBOOK_APP_ID;
  const scopeList = process.env.FACEBOOK_SCOPES
    ? process.env.FACEBOOK_SCOPES.split(",").map((s) => s.trim())
    : REQUIRED_FB_SCOPES;
  const scopes = scopeList.join(",");

  if (!appId) {
    throw new Error("Chưa cấu hình FACEBOOK_APP_ID trong biến môi trường.");
  }

  return (
    `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth` +
    `?client_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code`
  );
}

/**
 * Đổi authorization code lấy Short-lived User Token
 */
export async function exchangeCodeForToken(code: string, reqOrigin?: string): Promise<MetaOAuthTokenResponse> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = getRedirectUri(reqOrigin);

  if (!appId || !appSecret) {
    throw new Error("Chưa cấu hình FACEBOOK_APP_ID hoặc FACEBOOK_APP_SECRET.");
  }

  try {
    const res = await axios.get<MetaOAuthTokenResponse>(`${META_GRAPH_URL}/oauth/access_token`, {
      params: {
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code,
      },
    });
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.error?.message || error.message;
    throw new Error(`Lỗi đổi authorization code Meta: ${msg}`);
  }
}

/**
 * Đổi Short-lived Token lấy Long-Lived User Access Token (hạn 60 ngày)
 */
export async function getLongLivedUserToken(shortLivedToken: string): Promise<MetaOAuthTokenResponse> {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("Chưa cấu hình FACEBOOK_APP_ID hoặc FACEBOOK_APP_SECRET.");
  }

  try {
    const res = await axios.get<MetaOAuthTokenResponse>(`${META_GRAPH_URL}/oauth/access_token`, {
      params: {
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortLivedToken,
      },
    });
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.error?.message || error.message;
    throw new Error(`Lỗi lấy Long-Lived Token: ${msg}`);
  }
}

/**
 * Lấy thông tin tài khoản Facebook người dùng
 */
export async function getFacebookUserProfile(accessToken: string): Promise<MetaUserProfile> {
  try {
    const res = await axios.get<MetaUserProfile>(`${META_GRAPH_URL}/me`, {
      params: {
        fields: "id,name,email,picture.type(large)",
        access_token: accessToken,
      },
    });
    return res.data;
  } catch (error: any) {
    const msg = error.response?.data?.error?.message || error.message;
    throw new Error(`Lỗi lấy Facebook profile: ${msg}`);
  }
}

/**
 * Lấy danh sách Pages mà người dùng quản lý kèm Page Access Token
 */
export async function getFacebookPages(userAccessToken: string): Promise<MetaPageItem[]> {
  try {
    const res = await axios.get(`${META_GRAPH_URL}/me/accounts`, {
      params: {
        fields: "id,name,category,tasks,access_token,followers_count,fan_count,picture.type(large)",
        limit: 100,
        access_token: userAccessToken,
      },
    });
    return res.data?.data || [];
  } catch (error: any) {
    const msg = error.response?.data?.error?.message || error.message;
    console.error("Lỗi getFacebookPages:", msg);
    return [];
  }
}

/**
 * Lấy danh sách Groups của tài khoản
 */
export async function getFacebookGroups(userAccessToken: string): Promise<MetaGroupItem[]> {
  try {
    const res = await axios.get(`${META_GRAPH_URL}/me/groups`, {
      params: {
        fields: "id,name,administrator,member_count,picture.type(large)",
        limit: 100,
        access_token: userAccessToken,
      },
    });
    return res.data?.data || [];
  } catch (error: any) {
    // Meta có thể hạn chế quyền groups_access_member_info nếu chưa duyệt app
    const msg = error.response?.data?.error?.message || error.message;
    console.warn("Lỗi getFacebookGroups (có thể do quyền App Review):", msg);
    return [];
  }
}

/**
 * Ghép nội dung bài viết kèm liên hệ và link
 */
export function buildPostCaption(content: string, contactInfo?: string | null, linkUrl?: string | null): string {
  let message = content.trim();
  if (contactInfo && contactInfo.trim()) {
    message += `\n\n📞 Liên hệ: ${contactInfo.trim()}`;
  }
  if (linkUrl && linkUrl.trim()) {
    message += `\n🌐 Xem chi tiết: ${linkUrl.trim()}`;
  }
  return message;
}

/**
 * Đăng bài viết lên Facebook Page qua Meta Graph API chính thức
 */
export async function publishToFacebookPage(
  pageId: string,
  pageAccessToken: string,
  content: string,
  imageUrls: string[] = [],
  linkUrl?: string | null,
  contactInfo?: string | null
): Promise<PublishResult> {
  const message = buildPostCaption(content, contactInfo, linkUrl);

  try {
    // Trường hợp 1: Đăng nhiều ảnh (Multi-photo post)
    if (imageUrls && imageUrls.length > 1) {
      const mediaFbids: string[] = [];

      // Bước 1: Upload từng ảnh ở trạng thái unpublished
      for (const imgUrl of imageUrls) {
        try {
          const photoRes = await axios.post(`${META_GRAPH_URL}/${pageId}/photos`, null, {
            params: {
              url: imgUrl,
              published: false,
              access_token: pageAccessToken,
            },
          });
          if (photoRes.data?.id) {
            mediaFbids.push(photoRes.data.id);
          }
        } catch (uploadErr: any) {
          console.warn(`Lỗi upload ảnh con [${imgUrl}]:`, uploadErr.response?.data || uploadErr.message);
        }
      }

      // Nếu upload được ít nhất 1 ảnh thì đính kèm
      if (mediaFbids.length > 0) {
        const attachedMedia = mediaFbids.map((id) => ({ media_fbid: id }));
        const feedRes = await axios.post(`${META_GRAPH_URL}/${pageId}/feed`, null, {
          params: {
            message,
            attached_media: JSON.stringify(attachedMedia),
            access_token: pageAccessToken,
          },
        });

        return {
          success: true,
          status: "PUBLISHED",
          fbPostId: feedRes.data?.id,
          rawResponse: feedRes.data,
        };
      }
    }

    // Trường hợp 2: Đăng 1 ảnh duy nhất
    if (imageUrls && imageUrls.length === 1) {
      const photoRes = await axios.post(`${META_GRAPH_URL}/${pageId}/photos`, null, {
        params: {
          url: imageUrls[0],
          caption: message,
          published: true,
          access_token: pageAccessToken,
        },
      });

      return {
        success: true,
        status: "PUBLISHED",
        fbPostId: photoRes.data?.post_id || photoRes.data?.id,
        rawResponse: photoRes.data,
      };
    }

    // Trường hợp 3: Đăng bài chỉ có văn bản hoặc kèm link
    const params: Record<string, any> = {
      message,
      access_token: pageAccessToken,
    };
    if (linkUrl && linkUrl.trim()) {
      params.link = linkUrl.trim();
    }

    const feedRes = await axios.post(`${META_GRAPH_URL}/${pageId}/feed`, null, { params });

    return {
      success: true,
      status: "PUBLISHED",
      fbPostId: feedRes.data?.id,
      rawResponse: feedRes.data,
    };
  } catch (error: any) {
    const errorData = error.response?.data?.error;
    const errorMsg = errorData?.message || error.message || "Lỗi không xác định từ Meta API";
    const errorCode = errorData?.code;

    return {
      success: false,
      status: "FAILED",
      errorMessage: `[Meta Code ${errorCode || "N/A"}]: ${errorMsg}`,
      rawResponse: error.response?.data || { message: error.message },
    };
  }
}

/**
 * Đăng bài viết lên Facebook Group (hoặc xử lý hạn chế API của Meta)
 */
export async function publishToFacebookGroup(
  groupId: string,
  userAccessToken: string,
  content: string,
  imageUrls: string[] = [],
  linkUrl?: string | null,
  contactInfo?: string | null
): Promise<PublishResult> {
  const message = buildPostCaption(content, contactInfo, linkUrl);

  try {
    // Meta v19.0+ đã deprecated quyền publish_to_groups cho cá nhân thông thường.
    // Thực hiện gọi API thử nghiệm theo đúng quy chuẩn Meta Graph API
    const feedRes = await axios.post(`${META_GRAPH_URL}/${groupId}/feed`, null, {
      params: {
        message,
        access_token: userAccessToken,
      },
    });

    return {
      success: true,
      status: "PUBLISHED",
      fbPostId: feedRes.data?.id,
      rawResponse: feedRes.data,
    };
  } catch (error: any) {
    const errorData = error.response?.data?.error;
    const errorCode = errorData?.code;
    const errorMsg = errorData?.message || error.message;

    // Phân loại lỗi:
    // Code 200 (Permissions error), Code 3 (App does not have capability),
    // hoặc Group API deprecation message
    console.warn(`Meta Group Post Notice (GroupId: ${groupId}, Code: ${errorCode}):`, errorMsg);

    return {
      success: false,
      status: "MANUAL_ACTION_REQUIRED",
      errorMessage: "Group này không hỗ trợ đăng tự động bằng API hiện tại.",
      rawResponse: {
        reason: "META_GROUP_API_RESTRICTION",
        metaError: errorData,
        note: "Theo chính sách Meta Graph API v19.0+, tính năng đăng bài vào Facebook Group qua API đã bị hạn chế và yêu cầu thao tác thủ công (Manual Assisted Action).",
      },
    };
  }
}

/**
 * Router đăng bài thông minh: Tự động phân loại Page vs Group
 */
export async function executeFacebookPublish(options: FacebookPublishOptions): Promise<PublishResult> {
  if (options.destinationType === "PAGE") {
    if (!options.pageAccessToken) {
      return {
        success: false,
        status: "FAILED",
        errorMessage: "Không tìm thấy Page Access Token hợp lệ cho Trang này. Vui lòng đồng bộ lại kết nối Facebook.",
      };
    }

    return publishToFacebookPage(
      options.destinationId,
      options.pageAccessToken,
      options.content,
      options.imageUrls,
      options.linkUrl,
      options.contactInfo
    );
  } else if (options.destinationType === "GROUP") {
    return publishToFacebookGroup(
      options.destinationId,
      options.userAccessToken,
      options.content,
      options.imageUrls,
      options.linkUrl,
      options.contactInfo
    );
  }

  return {
    success: false,
    status: "FAILED",
    errorMessage: `Loại đích đăng bài không được hỗ trợ: ${options.destinationType}`,
  };
}
