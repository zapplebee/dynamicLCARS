import type { ReactNode } from "react";

type CommandsProps = {
  children: ReactNode;
  side: "left" | "right";
};

function Commands({ children, side }: CommandsProps) {
  return <div className={`lcars-commands lcars-commands--${side}`}>{children}</div>;
}

export default Commands;
