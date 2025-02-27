import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';

import { fDateTime } from 'src/utils/format-time';

import { FileThumbnail } from 'src/components/file-thumbnail';

import { CollapseButton } from './styles';

// ----------------------------------------------------------------------

export function ChatRoomAttachments({ attachments = [] }) {
  const collapse = useBoolean(true);

  // Make sure attachments is an array
  const safeAttachments = Array.isArray(attachments) ? attachments : [];
  const totalAttachments = safeAttachments.length;

  const renderList = () =>
    safeAttachments.map((attachment, index) => {
      // Skip rendering if attachment is null or undefined
      if (!attachment) return null;
      
      return (
        <Box 
          key={(attachment.name || `attachment-${index}`) + index} 
          sx={{ gap: 1.5, display: 'flex', alignItems: 'center' }}
        >
          <FileThumbnail
            imageView
            // Provide a fallback for the preview property
            file={attachment.preview || attachment.url || ''}
            onDownload={() => console.info('DOWNLOAD')}
            slotProps={{ icon: { sx: { width: 24, height: 24 } } }}
            sx={{ width: 40, height: 40, bgcolor: 'background.neutral' }}
          />

          <ListItemText
            primary={attachment.name || `File ${index + 1}`}
            secondary={attachment.createdAt ? fDateTime(attachment.createdAt) : ''}
            slotProps={{
              primary: { noWrap: true, sx: { typography: 'body2' } },
              secondary: {
                noWrap: true,
                sx: {
                  mt: 0.25,
                  typography: 'caption',
                  color: 'text.disabled',
                },
              },
            }}
          />
        </Box>
      );
    }).filter(Boolean); // Filter out any null values

  return (
    <>
      <CollapseButton
        selected={collapse.value}
        disabled={!totalAttachments}
        onClick={collapse.onToggle}
      >
        {`Attachments (${totalAttachments})`}
      </CollapseButton>

      {!!totalAttachments && (
        <Collapse in={collapse.value}>
          <Stack spacing={2} sx={{ p: 2 }}>
            {renderList()}
          </Stack>
        </Collapse>
      )}
    </>
  );
}