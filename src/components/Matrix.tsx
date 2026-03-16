import type { ReactNode } from "react";

type MatrixProps = {
  children: ReactNode;
};

function Matrix({ children }: MatrixProps) {
  return <div className="lcars-matrix">{children}</div>;
}

export default Matrix;
