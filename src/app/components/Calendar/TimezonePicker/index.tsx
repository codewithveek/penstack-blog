import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Box,
} from "@chakra-ui/react";
import timezones from "@/lib/timezones.json";
import { memo, useEffect, useState, useMemo, useCallback } from "react";
import { LuChevronDown, LuSearch } from "react-icons/lu";
import { FixedSizeList } from "react-window";

const ITEM_HEIGHT = 35;
const LIST_HEIGHT = 280;

const TimezonePicker = ({
  onChange,
  defaultValue = Intl.DateTimeFormat().resolvedOptions().timeZone,
}: {
  onChange: (timezone: string) => void;
  defaultValue?: string;
}) => {
  const [selectedTimezone, setSelectedTimezone] = useState(defaultValue);
  const [searchQuery, setSearchQuery] = useState("");
  const groupTextColor = useColorModeValue("gray.700", "gray.300");
  const searchCb = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  const groupedTimezones = useMemo(() => {
    const filtered = searchQuery
      ? timezones.filter((tz) =>
          tz.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : timezones;

    return filtered.reduce<Record<string, string[]>>((acc, tz) => {
      const region = tz.split("/")[0];
      if (!acc[region]) acc[region] = [];
      acc[region].push(tz);
      return acc;
    }, {});
  }, [searchQuery]);

  const flattenedTimezones = useMemo(() => {
    const result: { type: string; name?: string }[] = [];
    Object.entries(groupedTimezones).forEach(([region, zones]) => {
      result.push({ type: "group", name: region });
      zones.forEach((zone) => {
        result.push({ type: "item", name: zone });
      });
      result.push({ type: "divider" });
    });
    return result;
  }, [groupedTimezones]);

  const handleChange = useCallback((timezone: string) => {
    setSelectedTimezone(timezone);
  }, []);

  useEffect(() => {
    onChange(selectedTimezone);
  }, [onChange, selectedTimezone]);

  const TimezoneRow = memo(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = flattenedTimezones[index];
      const borderBottomColor = useColorModeValue("gray.200", "gray.500");
      const hoverBg = useColorModeValue("brand.100", "brand.500");
      const hoverColor = useColorModeValue("black", "white");

      if (item.type === "group") {
        return (
          <Text
            fontWeight="bold"
            pos="sticky"
            top={0}
            left={0}
            px={3}
            py={1}
            style={style}
            color={groupTextColor}
            borderBottom="1px solid"
            borderBottomColor={borderBottomColor}
          >
            {item.name}
          </Text>
        );
      }

      if (item.type === "divider") {
        return (
          <Box
            style={{ ...style, height: "4px", margin: "10px 0" }}
            bg={borderBottomColor}
          />
        );
      }

      return (
        <MenuItem
          value={item.name}
          rounded="full"
          bg={selectedTimezone === item.name ? "brand.500" : ""}
          color={selectedTimezone === item.name ? "white" : ""}
          _hover={{
            bg: hoverBg,
            color: hoverColor,
          }}
          onClick={() => handleChange(item.name || "")}
          style={{ ...style, marginTop: "8px" }}
        >
          {item.name}
        </MenuItem>
      );
    }
  );

  TimezoneRow.displayName = "TimezoneRow";

  return (
    <Stack gap={0}>
      <Text
        fontSize="sm"
        fontWeight={500}
        as="span"
        color={useColorModeValue("gray.500", "gray.400")}
      >
        Timezone:
      </Text>
      <Menu isLazy>
        {({ isOpen }) => (
          <>
            <MenuButton
              as={Button}
              size="sm"
              variant="outline"
              rounded="full"
              rightIcon={
                <Icon
                  as={LuChevronDown}
                  transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
                />
              }
            >
              {selectedTimezone || "Select timezone"}
            </MenuButton>
            <MenuList rounded="xl" maxH={LIST_HEIGHT} overflowY="auto" px={2}>
              <SearchInput
                searchQuery={searchQuery}
                setSearchQuery={searchCb}
              />
              <FixedSizeList
                height={LIST_HEIGHT}
                itemCount={flattenedTimezones.length}
                itemSize={ITEM_HEIGHT}
                width="100%"
              >
                {TimezoneRow}
              </FixedSizeList>
            </MenuList>
          </>
        )}
      </Menu>
    </Stack>
  );
};
const SearchInput = memo(
  ({
    searchQuery,
    setSearchQuery,
  }: {
    setSearchQuery: (query: string) => void;
    searchQuery: string;
  }) => {
    return (
      <Stack mb={2}>
        <InputGroup size="sm">
          <InputLeftElement>
            <LuSearch />
          </InputLeftElement>
          <Input
            placeholder="Search timezones..."
            size="sm"
            rounded="full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        </InputGroup>
      </Stack>
    );
  }
);

SearchInput.displayName = "SearchInput";
export default memo(TimezonePicker);
