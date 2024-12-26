import { listMtProps } from "./Util"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSpreadProps = (props: any) => {
  for (let index = 0; index < listMtProps.length; index++) {
    delete props[listMtProps[index]]
  }
  return props
}
