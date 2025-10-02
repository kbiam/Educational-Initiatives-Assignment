export interface Email {
  getContent(): string;
  getSubject(): string;
  getMetadata(): EmailMetadata;
}

export interface EmailMetadata {
  timestamp: Date;
  decorators: string[];
}

export class BasicEmail implements Email {
  private metadata: EmailMetadata;

  constructor(
    private subject: string = "No Subject",
    private message: string = "Hello, this is your message."
  ) {
    this.metadata = {
      timestamp: new Date(),
      decorators: []
    };
  }

  getContent(): string {
    return this.message;
  }

  getSubject(): string {
    return this.subject;
  }

  getMetadata(): EmailMetadata {
    return { ...this.metadata };
  }
}

export abstract class EmailDecorator implements Email {
  constructor(protected email: Email) {}

  abstract getContent(): string;

  getSubject(): string {
    return this.email.getSubject();
  }

  getMetadata(): EmailMetadata {
    const metadata = this.email.getMetadata();
    metadata.decorators.push(this.constructor.name);
    return metadata;
  }
}

export class SignatureDecorator extends EmailDecorator {
  constructor(
    email: Email,
    private name: string = "Your Company",
    private signatureStyle: string = "Regards",
    private includeContact: boolean = false
  ) {
    super(email);
  }

  getContent(): string {
    const signature = this.includeContact
      ? `\n\n-- ${this.signatureStyle}, ${this.name}\nEmail: contact@${this.name.toLowerCase().replace(/\s+/g, '')}.com`
      : `\n\n-- ${this.signatureStyle}, ${this.name}`;
    
    return this.email.getContent() + signature;
  }
}

export class PromoDecorator extends EmailDecorator {
  constructor(
    email: Email,
    private promoText: string = "Special Offer Just for You!",
    private emoji: string = "🎉"
  ) {
    super(email);
  }

  getContent(): string {
    return `${this.email.getContent()}\n\n${this.emoji} *** ${this.promoText} *** ${this.emoji}`;
  }
}

export class EncryptionDecorator extends EmailDecorator {
  private encrypted: boolean = false;

  getContent(): string {
    const content = this.email.getContent();
    this.encrypted = true;
    return `[ENCRYPTED]\n${btoa(content)}`;
  }

  getDecryptedContent(): string {
    const content = this.email.getContent();
    const base64Content = content.replace('[ENCRYPTED]\n', '');
  return Buffer.from(base64Content, "base64").toString("utf-8");
  }

  isEncrypted(): boolean {
    return this.encrypted;
  }

  getSubject(): string {
    return `🔒 ${this.email.getSubject()}`;
  }
}

export class FooterDecorator extends EmailDecorator {
  constructor(
    email: Email,
    private includeUnsubscribe: boolean = true,
    private includePrivacyPolicy: boolean = true
  ) {
    super(email);
  }

  getContent(): string {
    const footer: string[] = ['\n\n---'];
    
    if (this.includeUnsubscribe) {
      footer.push('To unsubscribe, click here: [Unsubscribe Link]');
    }
    
    if (this.includePrivacyPolicy) {
      footer.push('Privacy Policy: [Privacy Link]');
    }
    
    footer.push('© 2025 Your Company. All rights reserved.');
    
    return this.email.getContent() + footer.join('\n');
  }
}

export class HighlightDecorator extends EmailDecorator {
  constructor(
    email: Email,
    private keyword: string,
    private marker: string = '**'
  ) {
    super(email);
  }

  getContent(): string {
    const content = this.email.getContent();
    const regex = new RegExp(`\\b(${this.keyword})\\b`, 'gi');
    return content.replace(regex, `${this.marker}$1${this.marker}`);
  }
}

export function composeEmail(
  base: Email,
  ...decorators: ((email: Email) => Email)[]
): Email {
  return decorators.reduce((email, decorator) => decorator(email), base);
}

