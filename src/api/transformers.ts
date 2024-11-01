import { User, Message, Thread, Plan, UserSubscription, MessageType, MessageContent } from "../../shared/model";

export function buildUserFromResponse(res: any): User {
  return {
    id: res.id,
    email: res.email,
    username: res.username,
    picture: res.picture ?? null,
    stripeCustomerID: res.stripe_customer_id ?? null,
  };
}

export function buildPlanFromResponse(res: any): Plan {
  return {
    name: res.name,
    basicRequestLimit: res.basic_request_limit,
    premiumRequestLimit: res.premium_request_limit,
  };
}

export function buildUserSubscriptionFromResponse(res: any): UserSubscription {
  return {
    plan: res.plan ? buildPlanFromResponse(res.plan) : null,
    basicRequestsUsed: res.basic_requests_used,
    premiumRequestsUsed: res.premium_requests_used,
    lastResetDate: new Date(res.last_reset_date),
    createdAt: new Date(res.created_at),
    endDate: res.end_date ? new Date(res.end_date) : null,
  };
}

function buildMessageContentFromResponse(res: any): MessageContent {
  if (res.type === MessageType.Figma) {
    return { type: MessageType.Figma, fileID: res.file_id, nodeID: res.node_id, image: res.image };
  }
  if (res.type === MessageType.Image) {
    return { type: MessageType.Image, image: res.image };
  }
  return { type: MessageType.Text, text: res.content };
}

export function buildMessageFromResponse(res: any): Message {
  return {
    id: res.id,
    threadID: res.thread_id,
    role: res.role,
    content: buildMessageContentFromResponse(res.content),
    feedback: res.feedback ?? undefined,
    updatedAt: new Date(res.updated_at),
    createdAt: new Date(res.created_at),
  };
}

export function buildThreadFromResponse(res: any): Thread {
  return {
    id: res.id,
    title: res.title,
    updatedAt: new Date(res.updated_at),
    createdAt: new Date(res.created_at),
    messages: (res.messages ?? []).map((msg: any) => buildMessageFromResponse(msg)),
  };
}
