"use client";

import type { RefObject } from "react";

import DesktopChatRoomView from "@/components/messages/desktop/DesktopChatRoomView";
import MobileChatRoomView from "@/components/messages/mobile/MobileChatRoomView";

import type { Conversation } from "@/features/messages/types/conversation.types";

import { useServiceAgreementPanel } from "./hooks/useServiceAgreementPanel";
import ServiceRequestChatProposalModal from "./ServiceRequestChatProposalModal";

import type { ServiceRequestDetail } from "./types/service-request-read.types";

interface Message {
  id: string;

  content: string;

  sender_id: string;

  created_at: string;
}

interface ChatUser {
  full_name: string;

  avatar_url?: string;
}

interface ServiceRequestChatExperienceProps {
  loading: boolean;

  messages: Message[];

  conversations: Conversation[];

  conversationId: string;

  currentUserId: string;

  otherUser: ChatUser | null;

  message: string;

  sending: boolean;

  bottomRef: RefObject<HTMLDivElement | null>;

  serviceRequestDetail: ServiceRequestDetail;

  setMessage: (value: string) => void;

  handleSendMessage: () => void;

  onRequestChanged: () => void | Promise<void>;
}

export default function ServiceRequestChatExperience({
  loading,
  messages,
  conversations,
  conversationId,
  currentUserId,
  otherUser,
  message,
  sending,
  bottomRef,
  serviceRequestDetail,
  setMessage,
  handleSendMessage,
  onRequestChanged,
}: ServiceRequestChatExperienceProps) {
  const isProvider =
    currentUserId ===
    serviceRequestDetail.providerId;

  const isCustomer =
    currentUserId ===
    serviceRequestDetail.customerId;

  const {
    agreements,
    actionErrorMessage,
    actionPending,
    canPropose,
    proposalOpen,
    proposalDraft,
    onOpenProposal,
    onCancelProposal,
    onProposalFieldChange,
    onPaymentPlanTypeChange,
    onPaymentStepFieldChange,
    onPaymentStepTriggerChange,
    onAddPaymentStep,
    onRemovePaymentStep,
    onSubmitProposal,
  } = useServiceAgreementPanel({
    requestId:
      serviceRequestDetail.id,
    requestStatus:
      serviceRequestDetail.status,
    isProvider,
    isCustomer,
    onRequestChanged,
  });

  return (
    <>
      <MobileChatRoomView
        loading={loading}
        messages={messages}
        serviceRequestDetail={
          serviceRequestDetail
        }
        serviceAgreements={
          agreements
        }
        canCreateServiceProposal={
          canPropose
        }
        onCreateServiceProposal={
          onOpenProposal
        }
        currentUserId={currentUserId}
        otherUser={otherUser}
        message={message}
        sending={sending}
        bottomRef={bottomRef}
        setMessage={setMessage}
        handleSendMessage={
          handleSendMessage
        }
      />

      <DesktopChatRoomView
        loading={loading}
        messages={messages}
        conversations={conversations}
        conversationId={
          conversationId
        }
        serviceAgreements={
          agreements
        }
        serviceRequestDetail={
          serviceRequestDetail
        }
        canCreateServiceProposal={
          canPropose
        }
        onCreateServiceProposal={
          onOpenProposal
        }
        currentUserId={currentUserId}
        otherUser={otherUser}
        message={message}
        sending={sending}
        bottomRef={bottomRef}
        setMessage={setMessage}
        handleSendMessage={
          handleSendMessage
        }
      />

      {proposalOpen && (
        <ServiceRequestChatProposalModal
          proposalDraft={proposalDraft}
          actionPending={
            actionPending
          }
          actionErrorMessage={
            actionErrorMessage
          }
          onCancel={
            onCancelProposal
          }
          onProposalFieldChange={
            onProposalFieldChange
          }
          onPaymentPlanTypeChange={
            onPaymentPlanTypeChange
          }
          onPaymentStepFieldChange={
            onPaymentStepFieldChange
          }
          onPaymentStepTriggerChange={
            onPaymentStepTriggerChange
          }
          onAddPaymentStep={
            onAddPaymentStep
          }
          onRemovePaymentStep={
            onRemovePaymentStep
          }
          onSubmit={
            onSubmitProposal
          }
        />
      )}
    </>
  );
}