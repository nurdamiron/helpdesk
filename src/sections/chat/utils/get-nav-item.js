// ----------------------------------------------------------------------

export function getNavItem({ conversation, currentEmployeeId }) {
  // Safety check: ensure conversation and its properties exist
  if (!conversation || !conversation.messages || !conversation.participants) {
    // Return default values to prevent errors
    return {
      group: false,
      displayName: 'Unknown',
      displayText: '',
      participants: [],
      lastActivity: new Date(),
      hasOnlineInGroup: false
    };
  }

  const { messages, participants } = conversation;

  // Now it's safe to filter
  const participantsInConversation = participants.filter(
    (participant) => participant && participant.id !== currentEmployeeId
  );

  // Get the last message safely
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  const group = participantsInConversation.length > 1;

  const displayName = participantsInConversation.map((participant) => participant?.name || 'Unknown').join(', ');

  const hasOnlineInGroup = group
    ? participantsInConversation.some((item) => item && item.status === 'online')
    : false;

  let displayText = '';

  if (lastMessage) {
    const sender = lastMessage.senderId === currentEmployeeId ? 'You: ' : '';
    const message = lastMessage.contentType === 'image' ? 'Sent a photo' : lastMessage.body || '';
    displayText = `${sender}${message}`;
  }

  return {
    group,
    displayName,
    displayText,
    participants: participantsInConversation,
    lastActivity: lastMessage?.createdAt || new Date(),
    hasOnlineInGroup,
  };
}
