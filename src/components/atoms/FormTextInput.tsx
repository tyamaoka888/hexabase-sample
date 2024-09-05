import React, { FC } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface Props {
  register?: UseFormRegisterReturn;
}

export const FormTextInput: FC<Props> = ({ register }) => {
  return (
    <input
      type="text"
      className="rounded-lg p-1 border border-gray-300"
      {...register}
    />
  );
};
