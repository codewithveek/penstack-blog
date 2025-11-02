import { Link } from "@chakra-ui/next-js";
import { As, Heading } from "@chakra-ui/react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { memo, PropsWithChildren, ReactNode, useMemo } from "react";

interface HeadingsRendererProps {
  isEditing?: boolean;
  node: Partial<NodeViewProps["node"]>;
  content?: ReactNode;
}
export const PenstackHeadingsRenderer: React.FC<HeadingsRendererProps> = memo(
  ({ isEditing = true, node, content }) => {
    const styles: Record<string, Record<string, any>> = useMemo(
      () => ({
        h1: {
          fontSize: "2.25rem",
          as: "h1",
          mt: "1.75em",
          mb: "1em",
          fontWeight: 800,
          lineHeight: 1.2,
        },
        h2: {
          fontSize: "1.85rem",
          as: "h2",
          mt: "1.5em",
          mb: "0.75em",
          fontWeight: 700,
          lineHeight: 1.25,
        },
        h3: {
          fontSize: "1.5rem",
          as: "h3",
          mt: "1.25em",
          mb: "0.5em",
          fontWeight: 600,
          lineHeight: 1.3,
        },
        h4: {
          fontSize: "1.25rem",
          as: "h4",
          mt: "1.15em",
          mb: "0.5em",
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h5: {
          fontSize: "1.125rem",
          as: "h5",
          mt: "1em",
          mb: "0.5em",
          fontWeight: 600,
          lineHeight: 1.4,
        },
        h6: {
          fontSize: "1rem",
          as: "h6",
          mt: "1em",
          mb: "0.5em",
          fontWeight: 600,
          lineHeight: 1.4,
        },
      }),
      []
    );

    const heading = (
      <Heading
        {...node?.attrs}
        as={("h" + node?.attrs?.level) as As}
        {...styles[("h" + node?.attrs?.level) as any]}
      >
        {isEditing ? node?.firstChild?.text : content}
      </Heading>
    );
    return (
      <>
        {isEditing ? (
          <NodeViewWrapper>{heading}</NodeViewWrapper>
        ) : (
          <Heading
            {...node?.attrs}
            as={("h" + node?.attrs?.level) as As}
            {...styles[("h" + node?.attrs?.level) as any]}
          >
            <Link href={`#${node?.attrs?.id}`} color={"inherit"}>
              {content}
            </Link>
          </Heading>
        )}
      </>
    );
  }
);

PenstackHeadingsRenderer.displayName = "PenstackHeadingsRenderer";
