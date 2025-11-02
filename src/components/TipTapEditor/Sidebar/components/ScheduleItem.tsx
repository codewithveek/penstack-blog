import { format } from "date-fns";
import { LuTimer } from "react-icons/lu";
import { Button, HStack, Icon, ListItem, Text } from "@chakra-ui/react";
import { PermissionGuard } from "../../../PermissionGuard";
import { CalendarPicker } from "../../CalendarPicker";
import { ScheduleItemProps } from "../types";

export const ScheduleItem = ({
  scheduledAt,
  isOpen,
  onClose,
  onToggle,
}: ScheduleItemProps) => {
  return (
    <PermissionGuard requiredPermission="posts:publish">
      <ListItem>
        <HStack justify="space-between">
          <HStack>
            <Text as="span" color="gray.500">
              <Icon as={LuTimer} mr={1} />
              Schedule:
            </Text>
            <Text as="span" fontWeight="semibold" textTransform="capitalize">
              {scheduledAt ? (
                <Text fontSize="small">
                  {format(new Date(scheduledAt), "MMM d, yyyy hh:mm a")}
                </Text>
              ) : (
                "Off"
              )}
            </Text>
          </HStack>
          <CalendarPicker
            defaultValue={scheduledAt ? new Date(scheduledAt) : undefined}
            isOpen={isOpen}
            onClose={onClose}
            trigger={
              <Button variant="ghost" size="xs" onClick={onToggle}>
                Edit
              </Button>
            }
          />
        </HStack>
      </ListItem>
    </PermissionGuard>
  );
};
