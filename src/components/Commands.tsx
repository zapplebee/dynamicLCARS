import type { ReactNode } from "react";

type CommandsProps = {
  children: ReactNode;
};

function Commands({ children }: CommandsProps) {
  return <div className="lcars-commands">{children}</div>;
}

export default Commands;
