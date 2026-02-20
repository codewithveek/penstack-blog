import { Box, Button, HStack, List, Text } from "@chakra-ui/react";
import { EditorActionItem } from "@/types";

import { Editor } from "@tiptap/react";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { IconType } from "react-icons";
import { LuChevronsUpDown } from "react-icons/lu";
import { useColorModeValue } from "@/components/ui/color-mode";

interface Option {
  id: number | string;
  label: string;
  icon?: IconType;
}

interface AccessibleDropdownProps<T extends Option | EditorActionItem> {
  label?: string;
  options: T[];
  onSelect?: (option: T) => void;
  defaultValue?: T;
  className?: string;
  onOpen?: () => void;
  editor: Editor | null;
}

function AccessibleDropdown<T extends Option | EditorActionItem>({
  label = "",
  options = [],
  onSelect,
  defaultValue,
  className = "",
  onOpen,
  editor,
}: AccessibleDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<T | null>(
    defaultValue || null
  );

  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<(HTMLLIElement | null)[]>([]);
  const iconColor = useColorModeValue("gray.500", "gray.200");
  const activeTextColor = useColorModeValue("white", "white");
  const textColor = useColorModeValue("black", "white");
  const bgColor = useColorModeValue("white", "gray.900");
  const hoverBgColor = useColorModeValue("brand.100", "brand.600");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ): void => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex((prev) => (prev + 1) % options.length);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(options.length - 1);
        } else {
          setActiveIndex(
            (prev) => (prev - 1 + options.length) % options.length
          );
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && activeIndex >= 0) {
          const selectedOption = options[activeIndex];
          handleSelect(selectedOption);
        } else {
          setIsOpen(true);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (option: T): void => {
    setSelectedOption(option);
    setIsOpen(false);
    onSelect?.(option);
    const _option = option as EditorActionItem;
    if (editor) {
      if (_option?.id === "insert-media") {
        _option.command?.({ editor, open: onOpen });
      } else {
        _option.command?.({ editor });
      }
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && optionsRef.current[activeIndex]) {
      optionsRef.current[activeIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex]);
  // TODO: Fix: select active item based on the editor active item
  return (
    <Box className={`relative w-auto ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby="dropdown-label"
        type="button"
        variant={"ghost"}
      >
        <HStack>
          {selectedOption &&
            selectedOption?.icon &&
            React.createElement(selectedOption?.icon, {
              color: iconColor,
            })}
          <LuChevronsUpDown />
        </HStack>
      </Button>

      <div id="dropdown-label" className="sr-only">
        {label}
      </div>

      {isOpen && (
        <List.Root
          role="listbox"
          pos={"absolute"}
          zIndex={10}
          mt={1}
          py={2}
          minW={"200px"}
          px={2}
          gap={2}
          bg={bgColor}
          border={"1px"}
          borderColor={borderColor}
          rounded={"md"}
          shadow={"lg"}
          overflowY={"auto"}
          _focus={{ outline: "none" }}
          aria-labelledby="dropdown-label"
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const isActive =
              activeIndex === index && selectedOption?.id !== option.id;

            const isSelected =
              selectedOption?.id === option.id ||
              (option as EditorActionItem)?.active(editor as Editor);
            return (
              <List.Item
                display={"flex"}
                key={option.id}
                ref={(el: HTMLLIElement | null) => {
                  if (el) optionsRef.current[index] = el;
                }}
                py={2}
                px={4}
                cursor={"pointer"}
                bg={isActive ? hoverBgColor : isSelected ? "brand.600" : ""}
                color={isSelected ? activeTextColor : textColor}
                _hover={{
                  bg: isSelected ? "brand.600" : hoverBgColor,
                }}
                rounded={"xl"}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {/* color={item?.active(editor) ? activeTextColorValue : undefined}
              bg={item?.active(editor) ? "brand.500" : undefined}
              icon={React.createElement(item.icon, { size: 20 })}
              rounded="xl"
            > */}
                <HStack flexShrink={0}>
                  {option?.icon &&
                    React.createElement(option.icon, { size: 20 })}
                  <Text as="span" fontSize="16px" fontWeight={500}>
                    {option.label}
                  </Text>
                </HStack>
              </List.Item>
            );
          })}
        </List.Root>
      )}
    </Box>
  );
}
export default AccessibleDropdown;
