import { useMemo } from 'react';
import { keyBy } from 'es-toolkit';
import useSWR, { mutate } from 'swr';
import axios, { fetcher, endpoints } from 'src/lib/axios';

const enableServer = false;
const CHAT_ENDPOINT = endpoints.chat;

const swrOptions = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

/**
 * Хук для получения контактов.
 */
export function useGetContacts() {
  const url = [CHAT_ENDPOINT, { params: { endpoint: 'contacts' } }];
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  return useMemo(() => ({
    contacts: data?.contacts || [],
    contactsLoading: isLoading,
    contactsError: error,
    contactsValidating: isValidating,
    contactsEmpty: !isLoading && !isValidating && !(data?.contacts?.length),
  }), [data?.contacts, error, isLoading, isValidating]);
}

/**
 * Хук для получения списка бесед (чатов и тикетов).
 */
export function useGetConversations() {
  const url = [CHAT_ENDPOINT, { params: { endpoint: 'conversations' } }];
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  return useMemo(() => {
    const conversationsArray = data?.conversations || [];
    const byId = conversationsArray.length ? keyBy(conversationsArray, (conv) => conv.id) : {};
    const allIds = Object.keys(byId);
    return {
      conversations: { byId, allIds },
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !isValidating && !allIds.length,
    };
  }, [data?.conversations, error, isLoading, isValidating]);
}

/**
 * Хук для получения конкретной беседы по conversationId.
 * @param {string} conversationId - Идентификатор беседы.
 */
export function useGetConversation(conversationId) {
  const url = conversationId ? [CHAT_ENDPOINT, { params: { conversationId, endpoint: 'conversation' } }] : null;
  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);
  
  return useMemo(() => ({
    conversation: data?.conversation,
    conversationLoading: isLoading,
    conversationError: error,
    conversationValidating: isValidating,
    conversationEmpty: !isLoading && !isValidating && !data?.conversation,
  }), [data?.conversation, error, isLoading, isValidating]);
}

/**
 * Отправка сообщения в беседу.
 * @param {string} conversationId - Идентификатор беседы.
 * @param {object} messageData - Данные сообщения.
 */
export async function sendMessage(conversationId, messageData) {
  const conversationsUrl = [CHAT_ENDPOINT, { params: { endpoint: 'conversations' } }];
  const conversationUrl = [CHAT_ENDPOINT, { params: { conversationId, endpoint: 'conversation' } }];

  if (enableServer) {
    await axios.put(CHAT_ENDPOINT, { conversationId, messageData });
  }

  // Обновление данных конкретной беседы
  mutate(
    conversationUrl,
    (currentData) => {
      const currentConversation = currentData?.conversation || {};
      return {
        ...currentData,
        conversation: {
          ...currentConversation,
          messages: [...(currentConversation.messages || []), messageData],
        },
      };
    },
    false
  );

  // Обновление списка бесед
  mutate(
    conversationsUrl,
    (currentData) => {
      const currentConversations = currentData?.conversations || [];
      const updatedConversations = currentConversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, messages: [...(conv.messages || []), messageData] }
          : conv
      );
      return { ...currentData, conversations: updatedConversations };
    },
    false
  );
}

/**
 * Creates a new ticket in the system.
 * @param {object} ticketData - The ticket data from the form
 * @returns {Promise<object>} The created ticket/conversation data
 */
export async function createTicket(ticketData) {
  try {
    // Format the data according to what the backend expects
    const formattedData = {
      conversationData: {
        subject: ticketData.subject,
        type: 'ticket',
        status: 'new',
        category: ticketData.category || 'other',
        priority: ticketData.priority || 'medium',
        metadata: {
          requester: {
            full_name: ticketData.fullName,
            email: ticketData.email,
            phone: ticketData.phone || null,
            student_id: ticketData.studentId || null,
            faculty: ticketData.faculty || null,
            preferred_contact: ticketData.preferredContact || 'email'
          }
        },
        messages: [
          {
            sender_id: 999, // Placeholder ID that will be updated on the server
            body: ticketData.description,
            content_type: 'text',
          },
        ]
      }
    };

    // Send the request to create the ticket
    const response = await axios.post(CHAT_ENDPOINT, formattedData);
    
    // Update local cache of conversations if needed
    mutate(
      [CHAT_ENDPOINT, { params: { endpoint: 'conversations' } }],
      (currentData) => {
        const currentConversations = currentData?.conversations || [];
        return { 
          ...currentData, 
          conversations: [
            ...currentConversations, 
            response.data.conversation
          ] 
        };
      },
      false
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

/**
 * Обработка клика по беседе (маркировка как прочитанной).
 * @param {string} conversationId - Идентификатор беседы.
 */
export async function clickConversation(conversationId) {
  if (enableServer) {
    await axios.get(CHAT_ENDPOINT, { params: { conversationId, endpoint: 'mark-as-seen' } });
  }

  mutate(
    [CHAT_ENDPOINT, { params: { endpoint: 'conversations' } }],
    (currentData) => {
      const currentConversations = currentData?.conversations || [];
      const updatedConversations = currentConversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      );
      return { ...currentData, conversations: updatedConversations };
    },
    false
  );
}

/**
 * Обновление статуса тикета.
 * @param {string} id - Идентификатор тикета (беседы).
 * @param {string} status - Новый статус (например, "in_progress", "resolved", "closed").
 */
export async function updateTicketStatus(id, status) {
  const url = `${CHAT_ENDPOINT}/ticket/${id}`;
  const res = await axios.patch(url, { status });
  
  // Обновляем локальный кеш списка бесед
  mutate(
    [CHAT_ENDPOINT, { params: { endpoint: 'conversations' } }],
    (currentData) => {
      const currentConversations = currentData?.conversations || [];
      const updatedConversations = currentConversations.map((conv) =>
        conv.id === id ? { ...conv, status } : conv
      );
      return { ...currentData, conversations: updatedConversations };
    },
    false
  );
  
  return res.data;
}

/**
 * Удаление беседы (тикета) вместе с её сообщениями и участниками.
 * @param {string} id - Идентификатор беседы.
 */
export async function deleteConversation(id) {
  const url = `${CHAT_ENDPOINT}/conversation/${id}`;
  const res = await axios.delete(url);
  
  // Обновляем локальный кеш списка бесед
  mutate(
    [CHAT_ENDPOINT, { params: { endpoint: 'conversations' } }],
    (currentData) => {
      const currentConversations = currentData?.conversations || [];
      const updatedConversations = currentConversations.filter((conv) => conv.id !== id);
      return { ...currentData, conversations: updatedConversations };
    },
    false
  );
  
  return res.data;
}

/**
 * Удаление отдельного сообщения.
 * @param {string} id - Идентификатор сообщения.
 */
export async function deleteMessage(id) {
  const url = `${CHAT_ENDPOINT}/message/${id}`;
  const res = await axios.delete(url);
  // При необходимости можно обновить локальный кеш для конкретной беседы
  return res.data;
}
