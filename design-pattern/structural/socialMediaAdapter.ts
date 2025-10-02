interface SocialMedia {
  postMessage(msg: string): Promise<PostResult>;
  getName(): string;
  getCharacterLimit(): number;
}

export interface PostResult {
  success: boolean;
  platform: string;
  messageId?: string | undefined;
  error?: string | undefined;
  timestamp: Date;
}

// Legacy platform classes
export class Twitter {
  tweet(content: string): { id: string; status: string } {
    console.log(`Tweeted: ${content}`);
    return { id: `tw_${Date.now()}`, status: 'posted' };
  }
}

export class Facebook {
  share(post: string): { postId: string } {
    console.log(`Shared on FB: ${post}`);
    return { postId: `fb_${Date.now()}` };
  }
}

export class LinkedIn {
  publish(content: string): boolean {
    console.log(`Published on LinkedIn: ${content}`);
    return true;
  }
}

export class Instagram {
  post(caption: string, imageUrl?: string): { success: boolean; id?: string } {
    console.log(`Posted on Instagram: ${caption}`);
    return { success: true, id: `ig_${Date.now()}` };
  }
}

// Individual adapters for type safety and clarity
export class TwitterAdapter implements SocialMedia {
  constructor(private twitter: Twitter) {}

  getName(): string {
    return 'Twitter';
  }

  getCharacterLimit(): number {
    return 280;
  }

  async postMessage(msg: string): Promise<PostResult> {
    try {
      if (msg.length > this.getCharacterLimit()) {
        return {
          success: false,
          platform: this.getName(),
          error: `Message exceeds ${this.getCharacterLimit()} character limit`,
          timestamp: new Date()
        };
      }

      const result = this.twitter.tweet(msg);
      return {
        success: true,
        platform: this.getName(),
        ...(result.id ? { messageId: result.id } : {}),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: this.getName(),
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
}

export class FacebookAdapter implements SocialMedia {
  constructor(private facebook: Facebook) {}

  getName(): string {
    return 'Facebook';
  }

  getCharacterLimit(): number {
    return 63206;
  }

  async postMessage(msg: string): Promise<PostResult> {
    try {
      const result = this.facebook.share(msg);
      return {
        success: true,
        platform: this.getName(),
        messageId: result.postId,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: this.getName(),
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
}

export class LinkedInAdapter implements SocialMedia {
  constructor(private linkedIn: LinkedIn) {}

  getName(): string {
    return 'LinkedIn';
  }

  getCharacterLimit(): number {
    return 3000;
  }

  async postMessage(msg: string): Promise<PostResult> {
    try {
      const success = this.linkedIn.publish(msg);
      return {
        success,
        platform: this.getName(),
        ...(success ? { messageId: `li_${Date.now()}` } : {}),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: this.getName(),
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
}

export class InstagramAdapter implements SocialMedia {
  constructor(private instagram: Instagram) {}

  getName(): string {
    return 'Instagram';
  }

  getCharacterLimit(): number {
    return 2200;
  }

  async postMessage(msg: string): Promise<PostResult> {
    try {
      const result = this.instagram.post(msg);
      return {
        success: result.success,
        platform: this.getName(),
        messageId: result.id,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        platform: this.getName(),
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }
}

// Multi-platform broadcaster
export class SocialMediaBroadcaster {
  private platforms: SocialMedia[] = [];

  addPlatform(platform: SocialMedia): this {
    this.platforms.push(platform);
    return this;
  }

  removePlatform(platformName: string): this {
    this.platforms = this.platforms.filter(
      p => p.getName() !== platformName
    );
    return this;
  }

  async broadcast(message: string): Promise<PostResult[]> {
    const promises = this.platforms.map(platform => 
      platform.postMessage(message)
    );
    return Promise.all(promises);
  }

  async broadcastToSelected(
    message: string,
    platformNames: string[]
  ): Promise<PostResult[]> {
    const selected = this.platforms.filter(p => 
      platformNames.includes(p.getName())
    );
    const promises = selected.map(platform => 
      platform.postMessage(message)
    );
    return Promise.all(promises);
  }

  getPlatforms(): string[] {
    return this.platforms.map(p => p.getName());
  }
}

// Utility function to validate message for all platforms
export function validateMessage(
  message: string,
  platforms: SocialMedia[]
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  platforms.forEach(platform => {
    const limit = platform.getCharacterLimit();
    if (message.length > limit) {
      issues.push(
        `Message too long for ${platform.getName()} (${message.length}/${limit} chars)`
      );
    }
  });

  return {
    valid: issues.length === 0,
    issues
  };
}

