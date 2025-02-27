import { useState, useEffect, useCallback, startTransition } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { CONFIG } from 'src/global-config';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetContacts, useGetConversation, useGetConversations } from 'src/actions/chat';
import { EmptyContent } from 'src/components/empty-content';
import { useMockedEmployee } from 'src/auth/hooks';

import { ChatNav } from '../chat-nav';
import { ChatLayout } from '../layout';
import { ChatRoom } from '../chat-room';
import { ChatMessageList } from '../chat-message-list';
import { ChatMessageInput } from '../chat-message-input';
import { ChatHeaderDetail } from '../chat-header-detail';
import { ChatHeaderCompose } from '../chat-header-compose';
import { TicketDetail } from '../ticket-detail';
import { useCollapseNav } from '../hooks/use-collapse-nav';

// ----------------------------------------------------------------------

export function ChatView() {
  const router = useRouter();
  const { employee } = useMockedEmployee();
  const { contacts } = useGetContacts();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get('id') || '';
  
  const { conversations, conversationsLoading } = useGetConversations();
  const { conversation, conversationError, conversationLoading } =
    useGetConversation(selectedConversationId);
  
  const roomNav = useCollapseNav();
  const conversationsNav = useCollapseNav();
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    if (conversationError) {
      startTransition(() => {
        router.push(paths.dashboard.chat);
      });
    }
  }, [conversationError, router]);

  const handleAddRecipients = useCallback((selected) => {
    setRecipients(selected);
  }, []);

  const filteredParticipants = conversation
    ? conversation.participants?.filter((participant) => participant.id !== `${employee?.id}`) || []
    : [];

  const hasConversation = selectedConversationId && conversation;
  const isTicket = hasConversation && conversation.type === 'ticket';

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column' }}
    >
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        {isTicket ? 'Support Tickets' : 'Chat'}
      </Typography>

      <ChatLayout
        slots={{
          header: hasConversation ? (
            <ChatHeaderDetail
              collapseNav={roomNav}
              participants={filteredParticipants}
              loading={conversationLoading}
            />
          ) : (
            <ChatHeaderCompose contacts={contacts} onAddRecipients={handleAddRecipients} />
          ),
          nav: (
            <ChatNav
              contacts={contacts}
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              collapseNav={conversationsNav}
              loading={conversationsLoading}
            />
          ),
          main: (
            <>
              {selectedConversationId ? (
                conversationError ? (
                  <EmptyContent
                    title={conversationError.message}
                    imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-chat-empty.svg`}
                  />
                ) : isTicket ? (
                  // Display ticket detail for ticket type conversations
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                      <ChatMessageList
                        messages={conversation?.messages ?? []}
                        participants={filteredParticipants}
                        loading={conversationLoading}
                      />
                    </Box>
                    <ChatMessageInput
                      recipients={recipients}
                      onAddRecipients={handleAddRecipients}
                      selectedConversationId={selectedConversationId}
                      disabled={conversationLoading}
                    />
                  </Box>
                ) : (
                  // Display regular chat for chat type conversations
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                      <ChatMessageList
                        messages={conversation?.messages ?? []}
                        participants={filteredParticipants}
                        loading={conversationLoading}
                      />
                    </Box>
                    <ChatMessageInput
                      recipients={recipients}
                      onAddRecipients={handleAddRecipients}
                      selectedConversationId={selectedConversationId}
                      disabled={conversationLoading}
                    />
                  </Box>
                )
              ) : (
                <EmptyContent
                  title="Select a conversation"
                  description="Choose a conversation from the sidebar or create a new one"
                  imgUrl={`${CONFIG.assetsDir}/assets/icons/empty/ic-chat-active.svg`}
                />
              )}
            </>
          ),
          details: hasConversation && (
            isTicket ? (
              <TicketDetail
                conversation={conversation}
                loading={conversationLoading}
              />
            ) : (
              <ChatRoom
                collapseNav={roomNav}
                participants={filteredParticipants}
                loading={conversationLoading}
                messages={conversation?.messages ?? []}
              />
            )
          ),
        }}
      />
    </DashboardContent>
  );
}