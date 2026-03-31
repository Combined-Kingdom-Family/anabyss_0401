import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";

type SubmitConfirmModalProps = {
  isOpen: boolean;
  answeredCount: number;
  totalQuestions: number;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SubmitConfirmModal({
  isOpen,
  answeredCount,
  totalQuestions,
  onClose,
  onConfirm,
}: SubmitConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} title="제출 확인" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p>
          현재 {answeredCount} / {totalQuestions} 문항에 답했습니다.
        </p>
        <p>정말 제출하시겠습니까?</p>

        <div className="flex justify-end gap-2">
          <Button type="button" className="bg-gray-500 hover:bg-gray-600" onClick={onClose}>
            취소
          </Button>
          <Button type="button" onClick={onConfirm}>
            제출하기
          </Button>
        </div>
      </div>
    </Modal>
  );
}