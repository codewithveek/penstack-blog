import { ReactNode, useMemo, useRef, useState } from "react";
import Calendar from "@/components/Calendar";
import {
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useOutsideClick,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CRON_REQUEST_METHOD, CronJobPayload } from "@/lib/cron";
import { dateTimeToCronJobSchedule } from "@/lib/cron/helper";
import { addMinutes } from "date-fns";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";

export const CalendarPicker = ({
  defaultValue,
  isOpen,
  onClose,
  trigger,
}: {
  defaultValue?: Date;
  isOpen: boolean;
  onClose: () => void;
  trigger: ReactNode;
}) => {
  const popRef = useRef(null);
  useOutsideClick({
    ref: popRef,
    handler: onClose,
  });
  const activePostTitle = useEditorPostManagerStore(
    (state) => state.activePost?.title
  );
  const activePostId = useEditorPostManagerStore(
    (state) => state.activePost?.post_id
  );
  const updateField = useEditorPostManagerStore((state) => state.updateField);
  const defaultTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );
  const [dateValue, setDateValue] = useState<Date | undefined>(defaultValue);
  // State to manage the selected timezone
  const [timezone, setTimezone] = useState<string>(defaultTimezone);
  const toast = useToast({
    duration: 3000,
    isClosable: true,
    position: "top",
  });
  const { mutateAsync } = useMutation({
    mutationFn: async (bodyData: CronJobPayload) => {
      const { data } = await axios.post("/api/cron", bodyData);

      return data?.data;
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Something went wrong",
        status: "error",
      });
    },
  });
  function onDone(date: Date) {
    onClose();
    const payload: CronJobPayload = {
      job: {
        notification: {
          onFailure: true,
          onSuccess: true,
          onDisable: true,
        },
        url: "/api/schedules/auto-publish",
        enabled: true,
        title: activePostTitle || "Post schedule",
        schedule: {
          ...dateTimeToCronJobSchedule(new Date(date)),
          timezone,
          expiresAt: addMinutes(new Date(date), 60).toTimeString(),
        },
        saveResponses: true,
        requestMethod: CRON_REQUEST_METHOD.PUT,
        extendedData: {
          body: JSON.stringify({
            post_id: activePostId,
          }),
        },
      },
    };
    mutateAsync(payload).then((result) => {
      updateField("scheduled_at", date);
      updateField("schedule_id", result?.jobId);
      toast({ title: "Scheduled successfully" });
    });
  }
  function onCancel() {
    onClose();
  }
  return (
    <>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        onOpen={() => {
          if (!dateValue) {
            setDateValue(new Date());
          }
        }}
      >
        <PopoverTrigger>{trigger}</PopoverTrigger>
        <PopoverContent
          ref={popRef}
          border={0}
          p={0}
          rounded={"2xl"}
          _dark={{ bg: "#1a202c" }}
        >
          <PopoverBody>
            <Calendar
              onCancel={onCancel}
              onDone={onDone}
              defaultValue={dateValue}
              onTimezoneChange={(timezone) => {
                setTimezone(timezone);
              }}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  );
};
