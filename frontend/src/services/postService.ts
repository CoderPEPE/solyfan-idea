import { getAuthHeaders } from '../utils/auth';

export interface Post {
  id: string;
  userId: string;
  title: string;
  content?: string;
  mediaUrls: string[];
  mediaTypes: string[];
  isPublic: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

export interface CreatePostData {
  title: string;
  content?: string;
  mediaUrls: string[];
  mediaTypes: string[];
  isPublic: boolean;
}

export interface GetPostsParams {
  page?: number;
  limit?: number;
  userId?: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class PostService {
  private baseUrl = '/api/posts';

  async createPost(postData: CreatePostData): Promise<Post> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create post');
    }

    return response.json();
  }

  async getPosts(params: GetPostsParams = {}): Promise<PostsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.userId) queryParams.append('userId', params.userId);

    const url = `${this.baseUrl}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch posts');
    }

    return response.json();
  }

  async getPost(postId: string): Promise<Post> {
    const response = await fetch(`${this.baseUrl}/${postId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch post');
    }

    return response.json();
  }

  async updatePost(postId: string, postData: Partial<CreatePostData>): Promise<Post> {
    const response = await fetch(`${this.baseUrl}/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update post');
    }

    return response.json();
  }

  async deletePost(postId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete post');
    }
  }
}

export default new PostService();