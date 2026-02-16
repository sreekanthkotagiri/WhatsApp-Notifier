export class MessageResponseDto {
  success!: boolean;
  message?: string;
  messageId?: string;
  error?: {
    code: string;
    message: string;
  };
}
