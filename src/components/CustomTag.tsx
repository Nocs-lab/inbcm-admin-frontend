import React, { memo } from "react"

interface CustomTagProps extends React.HTMLAttributes<HTMLElement> {
  tagName?: keyof JSX.IntrinsicElements
}

const CustomTag = React.forwardRef<HTMLElement, CustomTagProps>(
  ({ tagName, children, ...props }, ref) => {
    if (tagName) {
      return React.createElement(tagName, { ...props, ref: ref }, children)
    } else {
      return <>{children}</>
    }
  }
)

CustomTag.displayName = "CustomTag"

export default memo(CustomTag)
