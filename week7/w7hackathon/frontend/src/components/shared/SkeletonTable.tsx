import { Skeleton, Stack } from "@mui/material";

export function SkeletonTable() {
  return (
    <Stack spacing={1.2}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={44} />
      ))}
    </Stack>
  );
}
