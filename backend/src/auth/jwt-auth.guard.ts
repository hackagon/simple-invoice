import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT authentication guard. Applied to all protected routes (every
 * /invoices endpoint and /auth/me) to enforce a valid access token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
