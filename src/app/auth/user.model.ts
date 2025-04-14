export class User {
  constructor(
    public firstname: string,
    public lastname: string,
    public email: string,
    public role: string,
    private access_token: string,
    private refresh_token: string,
    public expiration_date: Date
  ) {}

  get token() {
    if (!this.expiration_date || new Date() > this.expiration_date) {
      return null;
    }
    return this.access_token;
  }
}
