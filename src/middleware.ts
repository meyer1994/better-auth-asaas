import { APIError, createAuthMiddleware } from "better-auth/api";

export const requireWebhookAccessToken = (webhookAccessToken: string) =>
  createAuthMiddleware(async ctx => {
    const token = ctx.headers?.get("asaas-access-token");

    if (!token) {
      throw new APIError("UNAUTHORIZED", {
        message: "Missing asaas-access-token header",
      });
    }

    if (token !== webhookAccessToken) {
      throw new APIError("UNAUTHORIZED", {
        message: "Invalid webhook access token",
      });
    }
  });

/**
 * Middleware to require a user to have an Asaas customer ID.
 * 
 * @throws {APIError} UNAUTHORIZED - User not found
 * @throws {APIError} UNAUTHORIZED - User does not have Asaas customer ID
 */
export const requireAsaasCustomerId = createAuthMiddleware(async ctx => {
  const user = ctx.context.session?.user;

  if (!user) throw new APIError("UNAUTHORIZED", {
    message: 'User not found'
  });

  if (!user.asaasCustomerId) throw new APIError("UNAUTHORIZED", {
    message: `${user.email} does not have assaasCustomerId`,
  });

  ctx.context.logger.debug(
    'User has Asaas customer ID',
    { email: user.email, asaasCustomerId: user.asaasCustomerId }
  );
});
