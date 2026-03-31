"use client";

import { useState } from "react";
import type { StartExamRequest } from "@/types/user";
import { validateNickname, validateUserNumber } from "@/lib/validations";

export function useLandingForm() {
  const [nickname, setNickname] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const [nicknameError, setNicknameError] = useState("");
  const [userNumberError, setUserNumberError] = useState("");
  const [policyError, setPolicyError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [userNumberTouched, setUserNumberTouched] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const nicknameValidationMessage = validateNickname(nickname);
  const userNumberValidationMessage = validateUserNumber(userNumber);

  const isNicknameValid = nickname.trim() !== "" && !nicknameValidationMessage;
  const isUserNumberValid =
    userNumber.trim() !== "" && !userNumberValidationMessage;

  const handleNicknameChange = (value: string) => {
    setNickname(value);

    if (nicknameTouched) {
      setNicknameError(validateNickname(value) ?? "");
    }
  };

  const handleUserNumberChange = (value: string) => {
    setUserNumber(value);

    if (userNumberTouched) {
      setUserNumberError(validateUserNumber(value) ?? "");
    }
  };

  const handleNicknameBlur = () => {
    setNicknameTouched(true);
    setNicknameError(validateNickname(nickname) ?? "");
  };

  const handleUserNumberBlur = () => {
    setUserNumberTouched(true);
    setUserNumberError(validateUserNumber(userNumber) ?? "");
  };

  const handlePolicyChange = (checked: boolean) => {
    setAgreedToPolicy(checked);

    if (checked) {
      setPolicyError("");
    }
  };

  // 성공하면 true, 실패하면 false 반환
  const handleStartExam = async () => {
    const nextNicknameError = validateNickname(nickname) ?? "";
    const nextUserNumberError = validateUserNumber(userNumber) ?? "";
    const nextPolicyError = !agreedToPolicy
      ? "안내사항에 동의해주세요."
      : "";

    setNicknameTouched(true);
    setUserNumberTouched(true);

    setNicknameError(nextNicknameError);
    setUserNumberError(nextUserNumberError);
    setPolicyError(nextPolicyError);
    setSubmitError("");

    if (nextNicknameError || nextUserNumberError || nextPolicyError) {
      return false;
    }

    const requestData: StartExamRequest = {
      nickname: nickname.trim(),
      userNumber: userNumber.trim(),
      agreedToPolicy,
    };

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/exam/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(
          data.message || "시험 시작에 실패했습니다. 다시 시도해주세요."
        );
        return false;
      }

      localStorage.setItem(
        "examStartInfo",
        JSON.stringify({
          user: data.user,
          startedAt: data.startedAt,
        })
      );

      return true;
    } catch {
      setSubmitError("시험 시작 중 오류가 발생했습니다. 다시 시도해주세요.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    nickname,
    userNumber,
    agreedToPolicy,

    nicknameError,
    userNumberError,
    policyError,
    submitError,

    nicknameTouched,
    userNumberTouched,

    isNicknameValid,
    isUserNumberValid,
    isSubmitting,

    handleNicknameChange,
    handleUserNumberChange,
    handleNicknameBlur,
    handleUserNumberBlur,
    handlePolicyChange,
    handleStartExam,
  };
}