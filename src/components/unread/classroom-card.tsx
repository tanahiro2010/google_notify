import type { ClassroomCourseWork } from "../../types/classroom";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { formatDate } from "./utils";

const dueLabel = (work: ClassroomCourseWork) => {
  if (!work.dueDate) return null;
  const d = work.dueDate;
  const t = work.dueTime;
  const date = `${d.year}/${d.month}/${d.day}`;
  const time = t ? ` ${String(t.hours).padStart(2, "0")}:${String(t.minutes).padStart(2, "0")}` : "";
  return (
    <Typography component="span" variant="caption" color="error.main">
      期限 {date + time}
    </Typography>
  );
};

const ClassroomCard = ({ work }: { work: ClassroomCourseWork }) => (
  <Card
    variant="outlined"
    sx={{
      mb: 1,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 2,
      "&:hover": { borderColor: "primary.main" },
    }}
  >
    <CardContent sx={{ flex: 1, minWidth: 0, py: 1.5, "&:last-child": { pb: 1.5 } }}>
      <Typography
        variant="body2"
        noWrap
        title={work.title}
        gutterBottom
        sx={{ fontWeight: 500 }}
      >
        {work.title}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: "wrap", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          更新: {formatDate(work.updateTime)}
        </Typography>
        {dueLabel(work)}
      </Stack>
    </CardContent>
    <CardActions sx={{ p: 1.5, pt: 1.5, flexShrink: 0 }}>
      <Button
        component="a"
        href={work.alternateLink}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        variant="outlined"
        color="inherit"
        sx={{ minWidth: 0, color: "text.secondary" }}
      >
        開く
      </Button>
    </CardActions>
  </Card>
);

export { ClassroomCard };
