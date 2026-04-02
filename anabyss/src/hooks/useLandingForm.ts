"use client";

import { useState } from "react";
import type { StartExamRequest } from "@/types/user";
import { validateNickname, validateUserNumber } from "@/lib/validations";

export type StartExamFlowResult =
  | { ok: false }
  | { ok: true; mode: "play_only" }
  | { ok: true; mode: "go_exam" }
  | { ok: true; mode: "go_result"; resultPublicId: string };

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

  const isNicknameValid =
    nickname.trim() !== "" && !nicknameValidationMessage;
  const isUserNumberValid =
    userNumber.trim() !== "" && !userNumberValidationMessage;

  const [handwritingSample, setHandwritingSample] = useState("");

  const handleHandwritingSampleChange = (value: string) => {
    setHandwritingSample(value);
  };


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

  const handleStartExam = async (): Promise<StartExamFlowResult> => {
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
      return { ok: false };
    }

    const requestData: StartExamRequest = {
      nickname: nickname.trim(),
      userNumber: userNumber.trim(),
      agreedToPolicy,
      handwritingSample: handwritingSample.trim(),
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
        return { ok: false };
      }


      if (data.mode === "go_result") {
        return {
          ok: true,
          mode: "go_result",
          resultPublicId: data.resultPublicId,
        };
      }

      if (data.mode === "start_exam" || data.mode === "resume_exam") {
        sessionStorage.setItem(
          "examStartInfo",
          JSON.stringify({
            user: data.user,
            session: data.session,
          })
        );

        return {
          ok: true,
          mode: "go_exam",
        };
      }

      setSubmitError("알 수 없는 응답 형식입니다.");
      return { ok: false };
    } catch (error) {
      console.error("handleStartExam error:", error);
      setSubmitError("시험 시작 중 오류가 발생했습니다. 다시 시도해주세요.");
      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    nickname,
    userNumber,
    agreedToPolicy,
    handwritingSample,

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
    handleHandwritingSampleChange,

  };
}