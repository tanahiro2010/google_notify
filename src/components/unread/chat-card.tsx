import type { ChatSpace, ChatMessage } from "../../types/chat";
import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { formatDate } from "./utils";

const ChatMessageItem = ({ msg }: { msg: ChatMessage }) => (
  <Box sx={{ py: 1 }}>
    {msg.sender?.displayName && (
      <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600, display: "block" }}>
        {msg.sender.displayName}
      </Typography>
    )}
    <Typography variant="body2" sx={{ mt: 0.25 }}>
      {msg.text ?? "(画像など)"}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: "block" }}>
      {formatDate(msg.createTime)}
    </Typography>
  </Box>
);

const ChatSpaceSection = ({ space }: { space: ChatSpace & { messages: ChatMessage[] } }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
      {space.displayName ?? space.name}
    </Typography>
    <Stack divider={<Divider flexItem />} spacing={0}>
      {space.messages.map((msg) => (
        <ChatMessageItem key={msg.name} msg={msg} />
      ))}
    </Stack>
  </Paper>
);

export { ChatSpaceSection };
