import React, { ReactNode, useEffect, useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  isToday,
  addYears,
  subYears,
} from "date-fns";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { TimePicker } from "./TimePicker";
import {
  extractFullTimeString,
  mergeTimeStringWithDate,
} from "@/lib/cron/helper";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import TimezonePicker from "./TimezonePicker";

interface CalendarDataItem {
  day: number;
  dayOfWeek: string;
  isToday: boolean;
}

interface CalendarData {
  name: string;
  days: CalendarDataItem[];
}

interface CalendarProps {
  defaultValue?: Date;
  onDone?: (date: Date) => void;
  onCancel?: () => void;
  onDateSelect?: (date: Date) => void;
  onTimezoneChange?: (timezone: string) => void;
  startDate?: Date;
  endDate?: Date;
  footer?: ReactNode;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function generateCalendarData(date: Date): CalendarData {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  return {
    name: MONTHS[month],
    days: Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      dayOfWeek: DAYS_OF_WEEK[(firstDayOfMonth + i) % 7],
      isToday: isToday(new Date(year, month, i + 1)),
    })),
  };
}

const Calendar: React.FC<CalendarProps> = ({
  defaultValue = new Date(),
  onDateSelect = () => {},
  onCancel,
  onDone = () => {},
  onTimezoneChange = () => {},
  startDate: _startDate = new Date(),
  endDate: _endDate = addYears(new Date(), 10),
  footer,
}) => {
  const [currentDate, setCurrentDate] = useState(defaultValue);
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultValue);
  const [disablePrevBtn, setDisablePrevBtn] = useState(false);
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const [startDate, setStartDate] = useState(_startDate);
  const [endDate, setEndDate] = useState(_endDate);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBorderColor = useColorModeValue("gray.300", "gray.600");
  const weekDayColor = useColorModeValue("gray.500", "gray.400");
  const navBtnBg = useColorModeValue("white", "gray.700");
  const navBtnColor = useColorModeValue("gray.500", "gray.400");
  const navBtnHoverBg = useColorModeValue("brand.100", "gray.600");
  const navBtnHoverColor = useColorModeValue("black", "white");
  const dayHoverBg = useColorModeValue("brand.100", "gray.600");
  const todayBg = useColorModeValue("brand.100", "gray.700");
  const todayColor = "brand.500";
  const selectedBg = "brand.500";
  const selectedColor = "white";

  const handlePrevMonth = () => {
    if (currentDate.getTime() <= startDate.getTime()) return;
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    if (currentDate.getTime() >= endDate.getTime()) return;
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(selectedDate);
    if (typeof onDateSelect === "function") {
      onDateSelect?.(selectedDate);
    }
  };

  const currentMonthData = generateCalendarData(currentDate);

  useEffect(() => {
    setDisablePrevBtn(currentDate.getTime() <= startDate.getTime());
  }, [currentDate, startDate]);

  useEffect(() => {
    setDisableNextBtn(currentDate.getTime() >= endDate.getTime());
  }, [currentDate, endDate]);

  return (
    <Box
      width="300px"
      border="1px solid"
      borderColor={borderColor}
      borderRadius="18px"
      overflow="hidden"
      bg={bg}
      boxShadow="var(--card-raised-soft)"
      p="10px"
      fontSize="14px"
    >
      <Flex
        justify="space-between"
        align="center"
        borderBottom="1px solid"
        borderBottomColor={headerBorderColor}
        pb="10px"
        mb="10px"
        fontWeight="medium"
      >
        <Button
          aria-label="Previous Month"
          isDisabled={disablePrevBtn}
          onClick={handlePrevMonth}
          bg={navBtnBg}
          color={navBtnColor}
          size="sm"
          p="3px"
          borderRadius="6px"
          w="24px"
          h="24px"
          minW="24px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          _hover={{
            bg: navBtnHoverBg,
            color: navBtnHoverColor,
          }}
        >
          <LuChevronLeft />
        </Button>
        <Text>{format(currentDate, "MMMM yyyy")}</Text>
        <Button
          aria-label="Next Month"
          isDisabled={disableNextBtn}
          onClick={handleNextMonth}
          bg={navBtnBg}
          color={navBtnColor}
          size="sm"
          p="3px"
          borderRadius="6px"
          w="24px"
          h="24px"
          minW="24px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          _hover={{
            bg: navBtnHoverBg,
            color: navBtnHoverColor,
          }}
        >
          <LuChevronRight />
        </Button>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap="8px">
        {DAYS_OF_WEEK.map((day) => (
          <Text key={day} textAlign="center" color={weekDayColor}>
            {day}
          </Text>
        ))}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)" gap="8px" py="10px">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          .slice(0, DAYS_OF_WEEK.indexOf(currentMonthData.days[0].dayOfWeek))
          .map((_, i) => (
            <Box key={`empty-${i}`} />
          ))}
        {currentMonthData.days.map(({ day, isToday, dayOfWeek }) => {
          const isSelected =
            selectedDate?.getDate() === day &&
            selectedDate?.getMonth() === currentDate.getMonth() &&
            selectedDate?.getFullYear() === currentDate.getFullYear();
          return (
            <Button
              key={day}
              tabIndex={isSelected ? 0 : -1}
              bg={isSelected ? selectedBg : isToday ? todayBg : "transparent"}
              color={
                isSelected ? selectedColor : isToday ? todayColor : "inherit"
              }
              h="30px"
              w="30px"
              p="8px"
              fontSize="13px"
              onClick={() => handleDayClick(day)}
              _hover={{ bg: dayHoverBg }}
              borderRadius="6px"
            >
              {day}
            </Button>
          );
        })}
      </Grid>

      {footer ? (
        footer
      ) : (
        <Stack justify="space-between" mt={4}>
          <HStack
            align="center"
            my={4}
            justify="space-between"
            px={1}
            wrap="wrap"
          >
            <TimezonePicker
              onChange={(timezone) => {
                onTimezoneChange?.(timezone);
              }}
            />
            <TimePicker
              value={selectedDate ? (selectedDate as Date) : currentDate}
              onChange={(val) => {
                if (val)
                  setSelectedDate(
                    mergeTimeStringWithDate(val, selectedDate as Date)
                  );
              }}
            />
          </HStack>
          <Flex justify="flex-end" align="center" gap="10px" p="8px">
            <Button
              variant="outline"
              size="sm"
              borderRadius="16px"
              onClick={() => {
                onCancel?.();
                setSelectedDate(null);
              }}
              fontSize="13px"
              px="12px"
              py="3px"
              h="auto"
            >
              Cancel
            </Button>
            <Button
              colorScheme="brand"
              size="sm"
              borderRadius="16px"
              onClick={() => {
                onDone?.(selectedDate as Date);
                onDateSelect?.(selectedDate as Date);
              }}
              fontSize="13px"
              px="12px"
              py="3px"
              h="auto"
            >
              Done
            </Button>
          </Flex>
        </Stack>
      )}
    </Box>
  );
};

export default Calendar;
