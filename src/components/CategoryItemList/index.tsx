import { useCategories } from "@/hooks/useCategories";
import { HStack, Skeleton, Button, Card, CardBody } from "@chakra-ui/react";
import { useQueryState } from "nuqs";
import { useCallback, useEffect } from "react";

export const CategoryItemList = ({
  onChange,
  initialCategory = "",
}: {
  onChange?: (category: string) => void;
  initialCategory?: string;
}) => {
  const [categoryQuery, setCategoryQuery] = useQueryState("category", {
    throttleMs: 50,
    defaultValue: "",
  });

  const { data, isLoading: isCategoryLoading } = useCategories({
    limit: 5,
    hasPostsOnly: true,
  });
  const categories = data?.results;
  function isSelected(val: string) {
    return val === categoryQuery;
  }
  const onChangeCb = useCallback(
    (category: string) => {
      onChange?.(category);
    },
    [onChange]
  );
  function handleSelectedCategory(val: string) {
    setCategoryQuery(val);
    onChangeCb?.(val);
  }
  useEffect(() => {
    setCategoryQuery(initialCategory);
  }, [initialCategory]);
  return (
    <Card rounded={"sm"}>
      <CardBody>
        <HStack overflowX={"auto"} spacing={4} flexShrink={0}>
          {isCategoryLoading && !categories?.length ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                flexShrink={0}
                height={30}
                width={"80px"}
                rounded={"lg"}
              />
            ))
          ) : (
            <>
              <Button
                flexShrink={0}
                onClick={() => {
                  handleSelectedCategory("");
                }}
                value={""}
                letterSpacing={"0.02em"}
                size={"sm"}
                variant={isSelected("") ? "solid" : "ghost"}
              >
                All
              </Button>
              {[...(categories || [])?.map((cat) => cat.name)].map((val) => {
                return (
                  <Button
                    letterSpacing={"0.04em"}
                    flexShrink={0}
                    onClick={() => {
                      handleSelectedCategory(val);
                    }}
                    key={val}
                    value={val}
                    size={"sm"}
                    variant={isSelected(val) ? "solid" : "ghost"}
                  >
                    {val}
                  </Button>
                );
              })}
            </>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
};
