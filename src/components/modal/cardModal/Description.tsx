"use client";

import { updateCard } from "@/actions/updateCard";
import FormButtton from "@/components/form/FormButtton";
import FormTextarea from "@/components/form/FormTextarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAction } from "@/hooks/useAction";
import { CardWithList } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { AlignLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { ElementRef, useRef, useState } from "react";
import { toast } from "sonner";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

interface DescriptionProps {
  data: CardWithList;
}
const Description = ({ data }: DescriptionProps) => {
  const queryClient = useQueryClient();
  const params = useParams();

  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<ElementRef<"form">>(null);

  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };
  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  const { execute, fieldErrors } = useAction(updateCard, {
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
      toast.success(`Card "${data.title}" updated`);
      disableEditing();
    },
    OnError: error => {
      toast.error(error);
    },
  });

  const onSubmit = (formData: FormData) => {
    const description = formData.get("description") as string;
    const boardId = params.boardId as string;
    execute({
      id: data.id,
      description,
      boardId,
    });
  };

  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700"></AlignLeft>
      <div className="w-full">
        <p className="font-semibold text-neutral-700 mb-2">Description:</p>
        {isEditing ? (
          <form action={onSubmit} ref={formRef} className="space-y-2">
            <FormTextarea
              ref={textareaRef}
              id="description"
              className="w-full mt-2"
              placeholder="Add a more detailed description"
              defaultValue={data.description || undefined}
              errors={fieldErrors}
            ></FormTextarea>
            <div className="flex items-center gap-x-2">
              <FormButtton>Save</FormButtton>
              <Button
                type="button"
                onClick={disableEditing}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div
            onClick={enableEditing}
            className="min-h-[78px] bg-neutral-200 text-sm font-medium py-3 px-3 5 rounded-md"
          >
            {data.description || "Add a more detailed description..."}
          </div>
        )}
      </div>
    </div>
  );
};
export default Description;

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200"></Skeleton>
      <div className="w-full">
        <Skeleton className="h-6 w-24 mb-2 bg-neutral-200"></Skeleton>
        <Skeleton className="h-[78px] w-24 bg-neutral-200"></Skeleton>
      </div>
    </div>
  );
};