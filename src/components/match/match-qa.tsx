"use client";

import { analysisPresentation } from "@/lib/analysis-presentation";
import type { DatasetMode } from "@/lib/replay";
import { useState } from "react";
import { BookOpen, MessageCircleQuestion, Sparkles } from "lucide-react";

import type {
  MatchQuestionAnswer,
  PresetQuestionKey,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MatchQaProps = {
  answers: MatchQuestionAnswer[];
  mode: DatasetMode;
};

export function MatchQa({ answers, mode }: MatchQaProps) {
  const policy = analysisPresentation(mode);
  const initialAnswer = answers[0] ?? null;

  const [selectedKey, setSelectedKey] =
    useState<PresetQuestionKey | null>(initialAnswer?.key ?? null);

  const selectedAnswer =
    answers.find((answer) => answer.key === selectedKey) ?? initialAnswer;

  if (!selectedAnswer) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <Sparkles className="size-4" />
            Explore cached questions
          </div>

          <CardTitle className="text-xl">
            Explore the match from another angle
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {answers.map((answer) => {
              const isSelected = answer.key === selectedAnswer.key;

              return (
                <Button
                  key={answer.key}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className={
                    isSelected
                      ? "bg-emerald-700 hover:bg-emerald-800"
                      : ""
                  }
                  onClick={() => setSelectedKey(answer.key)}
                >
                  {answer.shortLabel}
                </Button>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl bg-emerald-50 p-5">
            <div className="mb-3 flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
                <MessageCircleQuestion className="size-5 text-emerald-700" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Answer
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">
                  {selectedAnswer.question}
                </h3>
              </div>
            </div>

            <p className="text-[15px] leading-7 text-slate-700">
              {selectedAnswer.answer}
            </p>

            {selectedAnswer.bullets?.length ? (
              <ul className="mt-4 space-y-2">
                {selectedAnswer.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex gap-3 text-sm leading-6 text-slate-600"
                  >
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="size-4 text-emerald-700" />
            {policy.contextLabel}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">{policy.contextMessage}</p>
          {selectedAnswer.sources.length === 0 && <p className="text-sm text-slate-500">No stored context snippets are available.</p>}
          {selectedAnswer.sources.map((source) => (
            <div
              key={`${selectedAnswer.key}-${source.title}`}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold text-slate-950">
                {source.title}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {source.snippet}
              </p>
            </div>
          ))}

          <p className="pt-2 text-xs leading-5 text-slate-400">
            These are stored, cached answers. Source timestamps and pre-kickoff
            information cutoffs have not been verified.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
