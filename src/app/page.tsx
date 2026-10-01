"use client";

import { Code, FileText, List, X } from "lucide-react";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";
import Hero from "@/components/Hero";
import DemoGallery from "@/components/DemoGallery";
import ZoomableImage from "@/components/ZoomableImage";
import JointDenoisingDemo from "@/components/JointDenoisingDemo";
import SkillExplorer from "@/components/SkillExplorer";
import FailureExplorer from "@/components/FailureExplorer";
import CitationBibtex from "@/components/CitationBibtex";
import { AverageBars, GroupedBars, LatencyChart, RoboTwinBars, TaskTable } from "@/components/Charts";
import {
  ABL_ATTENTION,
  ABL_GENERATION,
  ABL_LABEL,
  ABL_VISUAL,
  AFFILIATIONS,
  AUTHOR_NOTES,
  AUTHORS,
  BIBTEX,
  LINKS,
  LOGOS,
  OVERVIEW_POSTER,
  OVERVIEW_VIDEO,
  PRETRAIN_STATS,
  REAL_RESULTS,
} from "@/data/aw0";
import { asset } from "@/lib/asset";

const outlineItems: { href: string; label: string; level?: number }[] = [
  { href: "#article-title", label: "Title" },
  { href: "#abstract", label: "Abstract" },
  { href: "#overview", label: "Full video", level: 2 },
  { href: "#contributions", label: "Contributions" },
  { href: "#method", label: "Agentic World Action Model" },
  { href: "#joint-denoising", label: "Joint denoising", level: 2 },
  { href: "#annotation", label: "Agentic code annotation", level: 2 },
  { href: "#skills", label: "Skill library", level: 2 },
  { href: "#training", label: "Training recipe", level: 2 },
  { href: "#demos", label: "Demonstrations" },
  { href: "#simulation", label: "Simulation: RoboTwin 2.0" },
  { href: "#real-world", label: "Real-world experiments" },
  { href: "#hybrid", label: "Hybrid execution", level: 2 },
  { href: "#ablations", label: "Ablations" },
  { href: "#analysis", label: "What code changes" },
  { href: "#failures", label: "Failure cases" },
  { href: "#limitations", label: "Limitations" },
  { href: "#conclusion", label: "Conclusion" },
  ...(BIBTEX ? [{ href: "#citation", label: "Citation" }] : []),
];

function Outline({ activeHref }: { activeHref: string }) {
  return (
    <aside className="article-outline" aria-label="Article outline">
      <nav>
        {outlineItems.map((item) => (
          <a aria-current={activeHref === item.href ? "true" : undefined} data-level={item.level ?? 1} href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

function MobileOutline({ activeHref }: { activeHref: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div className="mobile-outline">
      <button aria-expanded={open} aria-label="Open table of contents" className="mobile-outline__trigger" onClick={() => setOpen(true)} type="button">
        <List aria-hidden="true" size={16} strokeWidth={1.9} /> Contents
      </button>
      <div className="mobile-outline__overlay" data-open={open} onClick={() => setOpen(false)} role="presentation">
        <nav aria-label="Table of contents" className="mobile-outline__panel" onClick={(e) => e.stopPropagation()}>
          <div className="mobile-outline__head">
            <span>Contents</span>
            <button aria-label="Close table of contents" onClick={() => setOpen(false)} type="button">
              <X size={18} strokeWidth={1.8} />
            </button>
          </div>
          <div className="mobile-outline__links">
            {outlineItems.map((item) => (
              <a
                aria-current={activeHref === item.href ? "true" : undefined}
                data-level={item.level ?? 1}
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

function ResourceLink({ href, icon, label }: { href: string | null; icon: React.ReactNode; label: string }) {
  if (!href) {
    return (
      <span aria-disabled="true" className="article-link" title={`${label} coming soon`}>
        {icon} {label} <span className="article-link__soon">soon</span>
      </span>
    );
  }
  return (
    <a className="article-link" href={href} rel="noopener noreferrer" target="_blank">
      {icon} {label}
    </a>
  );
}

function ArticleContent() {
  const [activeHref, setActiveHref] = useState(outlineItems[0].href);

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      const targetY = window.innerHeight * 0.28;
      let current = outlineItems[0].href;
      for (const item of outlineItems) {
        const section = document.getElementById(item.href.slice(1));
        if (!section) continue;
        if (section.getBoundingClientRect().top <= targetY) current = item.href;
      }
      setActiveHref((prev) => (prev === current ? prev : current));
    };
    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };
    request();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <section className="article-body" data-outline-open="true" id="article-content">
      <div className="article-layout">
        <Outline activeHref={activeHref} />
        <MobileOutline activeHref={activeHref} />
        <article className="article-shell">
          <header className="article-title-block" id="article-title">
            <h1>
              <span>AW-0: Agentic</span>
              <span>World Action Model</span>
            </h1>
            <div className="article-authors" aria-label="Authors and affiliations">
              <p className="article-authors__names">
                {AUTHORS.map((a, i) => (
                  <Fragment key={a.name}>
                    <span className="article-author">
                      {a.url ? (
                        <a className="article-author-link" href={a.url} rel="noopener noreferrer" target="_blank">
                          {a.name}
                        </a>
                      ) : (
                        a.name
                      )}
                      <sup>{a.marks}</sup>
                    </span>
                    {i < AUTHORS.length - 1 ? ", " : ""}
                  </Fragment>
                ))}
              </p>
              <p className="article-authors__affiliations">
                {AFFILIATIONS.map((af) => (
                  <span key={af.mark}>
                    <sup>{af.mark}</sup>
                    {af.label}
                  </span>
                ))}
              </p>
              <p className="article-authors__affiliations article-authors__notes">
                {AUTHOR_NOTES.map((n) => (
                  <span key={n.mark}>
                    <sup>{n.mark}</sup>
                    {n.label}
                  </span>
                ))}
              </p>
              <div className="article-links" aria-label="Resources">
                <ResourceLink href={LINKS.paper} icon={<FileText aria-hidden="true" size={16} strokeWidth={1.8} />} label="Paper" />
                <ResourceLink href={LINKS.code} icon={<Code aria-hidden="true" size={16} strokeWidth={1.8} />} label="Code" />
              </div>
              <div className="article-logo-row" aria-label="Institution logos">
                {LOGOS.map((logo) => (
                  <Image alt={logo.alt} className="article-logo-row__image" height={logo.h} key={logo.alt} src={asset(logo.src)} unoptimized width={logo.w} />
                ))}
              </div>
            </div>
          </header>

          {/* ---- Abstract ---- */}
          <h2 id="abstract">Abstract</h2>
          <p>
            Recent world action models provide visual foresight and future prediction for robot manipulation, but lack
            explicit mechanisms for compositional skill reuse. Agentic robotics combines code-based planning and reasoning
            with reusable skills, but often lacks predictive grounding in physical dynamics. We introduce{" "}
            <strong>AW-0</strong>, an agentic world action model framework that integrates code-based planning with joint
            video and action prediction. We jointly model code, future video, and robot actions as three coupled generative
            streams within a unified mixture-of-transformers architecture. Within this architecture a code expert generates
            parameterized skill routines and control logic while video and action experts generate future visual states and
            low-level motor commands. Code serves two complementary roles: it structures multi-step prediction and control
            within the world model and represents skills as reusable programs for subsequent agentic execution. We further
            introduce an automated curation pipeline that labels robot and human video trajectories with aligned programs
            and consolidates recurring routines into reusable skill libraries. Evaluations on RoboTwin 2.0 and physical
            bimanual manipulation tasks show improved task performance over VLA and WAM baselines, alongside gains in
            language following, semantic reasoning and robustness, demonstrating that agentic code enables connection
            between planning, prediction and execution within WAMs.
          </p>

          {/* ---- Full project film ---- */}
          <figure className="aw-figure" id="overview">
            <video
              aria-label="AW-0 full project video"
              className="fig-img"
              controls
              playsInline
              poster={asset(OVERVIEW_POSTER)}
              preload="none"
              src={asset(OVERVIEW_VIDEO)}
            />
            <figcaption><b>AW-0: Agentic World Action Model.</b> Full project video.</figcaption>
          </figure>

          {/* ---- Contributions ---- */}
          <h2 id="contributions">Contributions</h2>
          <p>
            AW-0 brings agentic robotic skills into a world action model: generating code improves the model&rsquo;s action
            prediction, and the code it generates can be reused in an agentic framework.
          </p>
          <ul>
            <li>
              <strong>A mixture-of-transformers WAM with a code expert</strong> — code, future video, and actions are denoised
              jointly, so the generated program guides both the predicted future and the motor commands.
            </li>
            <li>
              <strong>An automated agentic annotation pipeline</strong> — coding agents label robot and egocentric human
              demonstrations with aligned programs and distill recurring routines into reusable skills.
            </li>
            <li>
              <strong>A dataset of structured skill programs</strong> — 2,913 hours of robot and egocentric human
              demonstrations annotated with aligned programs, written against a frozen library of 50 skills.{" "}
              <mark className="aw-tbd">(to be determined)</mark>
            </li>
            <li>
              <strong>A hybrid execution policy</strong> — at every replanning point it either invokes the generated program
              or executes the action chunk from the action expert.
            </li>
          </ul>

          {/* ---- Method ---- */}
          <h2 id="method">Agentic World Action Model</h2>
          <p>
            AW-0 is a single conditional generative model over code, video, and actions. A skill program is a discrete token
            sequence <i>C</i>
            <sub>0</sub>, future observations are continuous video latents <i>Z</i>
            <sub>0</sub> from a pretrained VAE, and robot motion is an action chunk <i>A</i>
            <sub>0</sub> over a horizon of <i>H</i> steps. The model is conditioned on the current multi-view observations,
            the language instruction, the robot state, and a compact memory of the program slices generated so far.
          </p>
          <figure className="aw-figure">
            <ZoomableImage alt="The AW-0 framework" className="fig-img fig-img--pad" height={2240} src={asset("/figures/method.webp")} width={2800} />
            <figcaption>
              Figure 1: <b>AW-0 framework.</b> A Mixture-of-Transformers backbone with three experts generating code,
              video, and action, which are denoised jointly: video and action under continuous flow matching, code under
              discrete masked diffusion.
            </figcaption>
          </figure>
          <p>
            Each expert keeps its own attention projections, layer norms, and FFNs, and the experts communicate through
            masked joint attention at every layer. The <span className="xp xp--code">code expert</span> augments a
            pretrained diffusion LLM (LLaDA) with a frozen Qwen3-VL ViT, so the current views are encoded into visual tokens
            that ground skill planning in the scene. The <span className="xp xp--video">video expert</span> is a pretrained
            Cosmos-Predict2.5 video DiT over VAE-encoded future frames, and a separate{" "}
            <span className="xp xp--action">action DiT</span> generates the continuous action chunk with additional
            robot-state conditioning. Attention is bidirectional within each expert and blockwise causal across experts in
            the order code → video → action.
          </p>

          <h3 className="article-subsection" id="joint-denoising">
            Joint denoising
          </h3>
          <p>
            At every denoising step the backbone predicts code-token logits and continuous velocities at once. Video and
            actions use flow matching with a shifted noise schedule; code uses absorbing-mask corruption with a random mask
            ratio and is trained with cross-entropy on masked positions. At inference, the policy appends a canvas of{" "}
            <i>G</i> mask tokens and decodes it together with the video and action states over <i>T</i> steps, committing the{" "}
            <i>G</i>/<i>T</i> most confident positions per step. The code stream supplies planning context to both
            continuous experts throughout generation, and the action expert also reads the video representations. To give
            the action expert more informative video features, AW-0 resamples the video noise level from a mixture of the
            pretrained distribution and a uniform one, with importance weights that balance video learning against
            predictive guidance.
          </p>
          <JointDenoisingDemo figureNumber={2} />

          <h3 className="article-subsection" id="annotation">
            Agentic code annotation
          </h3>
          <p>
            Programs for training come from an automatic annotation pipeline. First, one episode per task is sampled and
            Gemini 3.1 Pro writes subtask-level programs against predefined, declaration-only primitive APIs, while Claude
            Code (Claude Opus 4.8) acts as a coordinator that distills recurring, task-general routines into skills. The
            skill library is then frozen and the sampled episodes are re-annotated with the final vocabulary, forming a cache
            of reusable subtask-to-program mappings. The remaining corpus reuses a cached program whenever a subtask&rsquo;s
            contact and motion pattern matches an existing entry, and calls the coding agent only on a cache miss.
          </p>
          <figure className="aw-figure">
            <ZoomableImage
              alt="Automatic annotation pipeline"
              className="fig-img fig-img--pad"
              height={1597}
              src={asset("/figures/annotation_pipeline.webp")}
              width={2400}
            />
            <figcaption>
              Figure 3: <b>Automatic annotation pipeline.</b> Coding agents generate subtask-level programs using predefined
              primitive APIs and available skills, while a coordinator distills recurring patterns into a library of
              reusable skills across tasks. With the library frozen, the corpus is annotated by reusing cached code when
              contact and motion evidence match and generating new labels otherwise.
            </figcaption>
          </figure>
          <p>
            During training, the code stream is a conditioning prompt followed by the <em>active slice</em>, a short block of
            primitive or skill calls for the current subtask; only the slice is masked and supervised. Because one frame
            rarely reveals task progress, the code expert also reads a <strong>memory cache</strong> of the slices generated
            so far in the episode, compressed into <i>K</i> learnable memory slots. By default the decoded slice is{" "}
            <em>not executed</em>: it is a plan that conditions the action expert, and the predicted action chunk drives the
            robot. In <strong>hybrid</strong> mode, the slice is executed Code-as-Policies style against a library of
            perception and control primitives whenever it passes stage, dependency, syntax, whitelist, and vacuity checks;
            otherwise the action chunk from the same forward pass drives the robot until the next replan.
          </p>

          <h3 className="article-subsection" id="skills">
            Skill library
          </h3>
          <p>
            The pipeline produced a frozen library of <strong>50 skills</strong>: 23 for YAM robot data and 27 for egocentric
            human data. Each skill is a Python function over the primitive API that takes the objects it acts on as
            arguments. 10 representative skills are shown here.
          </p>
          <SkillExplorer figureNumber={4} />

          <h3 className="article-subsection" id="training">
            Training recipe
          </h3>
          <p>
            AW-0 is pretrained on about 2,000 hours of YAM bimanual robot teleoperation and 1,000 hours of egocentric human
            manipulation, with every training window paired with its instruction and the aligned program slice. For each
            downstream task, the same pipeline labels the task demonstrations under the frozen skill library, and AW-0 is
            jointly fine-tuned on code, video, and action targets.
          </p>
          <div className="aw-stats">
            {PRETRAIN_STATS.map((s) => (
              <div className="aw-stat" key={s.label}>
                <div className="aw-stat__num">{s.num}</div>
                <div className="aw-stat__label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ---- Demonstrations ---- */}
          <h2 id="demos">Demonstrations</h2>
          <p>
            Real-world AW-0 rollouts on the eight tasks, on the YAM station (parallel grippers) and the Tianji–Sharpa
            platform (dexterous hands). Pick a task to watch the policy execute it; use the full-screen button to expand
            the video.
          </p>
          <DemoGallery />

          {/* ---- Simulation ---- */}
          <h2 id="simulation">Simulation: RoboTwin 2.0</h2>
          <p>
            We compare against π0.5 (a VLA with strong semantic reasoning), EgoScale (a VLA pretrained on large-scale
            egocentric human data), DreamZero (a WAM that jointly generates future video and actions), and WLA (an
            autoregressive model that predicts textual subtasks, subgoal images, and actions). All methods train on 50 clean
            demonstrations per task (2,500 episodes) and are evaluated on the <em>clean</em> setting and on the{" "}
            <em>random</em> setting with randomized backgrounds, textures, lighting, table height, and distractors.
          </p>
          <RoboTwinBars figureNumber={5} />
          <p>
            AW-0 reaches the highest average success rate, <strong>50.7%</strong>, driven by <strong>80.8%</strong> on the
            clean setting, 16.0 points above the strongest baseline WLA (64.8%). Under visual randomization the default mode
            drops to 20.6%, still above the strongest WAM baseline DreamZero (17.6%). <strong>Hybrid execution</strong>{" "}
            raises the random-setting success rate to <strong>29.2%</strong>, above every baseline including π0.5 (27.7%),
            and retains 46% of its clean-setting performance under randomization versus 25% for the default mode. The cost
            is on clean scenes, where the hybrid mode (63.1%) is 17.7 points below the default mode.
          </p>
          <figure className="aw-figure">
            <ZoomableImage
              alt="Hybrid execution on blocks_ranking_rgb"
              className="fig-img"
              height={471}
              src={asset("/figures/hybrid_blocks_ranking_rgb.webp")}
              width={2600}
            />
            <div style={{ height: 8 }} />
            <ZoomableImage
              alt="Hybrid execution on pick_dual_bottles"
              className="fig-img"
              height={471}
              src={asset("/figures/hybrid_pick_dual_bottles.webp")}
              width={2600}
            />
            <figcaption>
              Figure 6: How code execution and direct actions interleave in hybrid mode. Top, <i>blocks_ranking_rgb</i>: the
              three pick-and-place cycles run almost entirely as code, with direct actions around a stage transition. Bottom,{" "}
              <i>pick_dual_bottles</i>: code localizes a bottle but fails to secure the grasp; direct actions complete the
              grasp, then code resumes. On successful episodes, code drives 14.5% of steps in the clean setting and 35.0% in
              the random setting.
            </figcaption>
          </figure>

          {/* ---- Real world ---- */}
          <h2 id="real-world">Real-world experiments</h2>
          <p>
            We evaluate 8 real-world tasks on two embodiments: the <strong>YAM station</strong>, a fixed-base bimanual setup
            with two 6-DoF arms and parallel grippers, and the <strong>Tianji–Sharpa</strong> platform, a humanoid torso with
            two 22-DoF Sharpa dexterous hands. Both observe three RGB views and act in a unified 64-D state–action space.
            Each task is run for 3×16 rollouts under randomized initial object poses and scored with an additive rubric.
          </p>
          <AverageBars
            caption={
              <>
                Average rubric score (%) over the 8 real-world tasks. AW-0 reaches <b>71.1</b>, <b>+25.1 points</b> over the
                strongest baseline (DreamZero, 46.0).
              </>
            }
            figureNumber={7}
            rows={REAL_RESULTS}
          />
          <TaskTable
            caption={
              <>
                Table 1: Real-world results on 8 tasks across 2 embodiments. Average rubric score (%) over 3×16 rollouts
                per task; the best score in each column is in bold.
              </>
            }
            label="Method"
            rows={REAL_RESULTS.map((r) => ({ ...r, name: r.method }))}
          />
          <p>
            <strong>Language following and semantic reasoning.</strong> AW-0 is strongest on <i>Arrange Fruits</i> and{" "}
            <i>Flip Scoreboard</i>, which require instruction-specific object selection and counting. The VLA baselines,
            particularly π0.5, also show relatively strong semantic understanding, while the WAM baselines are less reliable
            here, which suggests that code-based planning strengthens exactly these abilities in a world action model.{" "}
            <strong>Robust skill execution.</strong> On contact-rich and dexterous tasks, DreamZero beats π0.5 on{" "}
            <i>Replace Lightbulb</i> and <i>Deal Poker</i>, where predicting future states gives stable physical-dynamics
            features; AW-0 goes further by combining guidance from generated skill programs with those predictive
            representations.
          </p>

          <h3 className="article-subsection" id="hybrid">
            Hybrid execution in the real world
          </h3>
          <p>
            On <i>Fold and Stack Towels</i> (YAM), hybrid execution reaches <strong>90.6%</strong> versus{" "}
            <strong>84.4%</strong> for action-chunk execution with the same post-trained model. Dexterous folding relies
            mainly on direct actions from the action expert, while executed code handles the more structured motions, such
            as approaching and stacking the towels, which gives direct guidance on stacking order and motion direction.
          </p>
          <figure className="aw-figure">
            <ZoomableImage
              alt="Hybrid actions on Fold and Stack Towels"
              className="fig-img"
              height={1149}
              src={asset("/figures/hybrid_fold_towels.webp")}
              width={2600}
            />
            <figcaption>
              Figure 8: Hybrid actions on <i>Fold and Stack Towels</i>. One episode continues from the upper to the lower
              row; green marks code execution and purple marks direct actions.
            </figcaption>
          </figure>

          {/* ---- Ablations ---- */}
          <h2 id="ablations">Ablations</h2>
          <p>
            All variants are post-trained and evaluated under the real-world protocol above.{" "}
            <strong>How should the code expert be integrated?</strong> Adding code between video and action (
            <i>V → C → A</i>) grounds the predicted dynamics to action but only lets code reason over video predictions.
            Placing code first (<i>C → V → A</i>) lets both video and action generation attend to the plan, so semantic task
            structure shapes future prediction throughout denoising, and gives the best result on 7 of 8 tasks.
          </p>
          <GroupedBars caption={<>Impact of the code expert and attention order. C, V, and A denote the code, video, and action streams.</>} figureNumber={9} series={ABL_ATTENTION} />
          <p>
            A dedicated ViT is also a better visual input for the code expert than reused Wan2.2 VAE features: VAE features
            are built for pixel reconstruction and poorly support the semantic distinctions needed to select and compose
            skills. ViT conditioning improves all 8 tasks, with substantial gains on <i>Pack Backpack</i> (64.6 vs. 39.6) and{" "}
            <i>Solve Cube</i> (72.1 vs. 53.9), which require fine-grained reasoning about object attributes and task states.
          </p>
          <TaskTable caption={<>Table 2: Visual conditioning for the code expert. Average rubric score (%).</>} label="Variant" rows={ABL_VISUAL} />
          <p>
            <strong>What makes code an effective planning representation?</strong> Full annotated programs beat comment-free
            code on all 8 tasks, so explanatory comments help connect program structure with task intent. Removing skill
            calls also hurts on all 8 tasks, especially on skill-heavy tasks such as <i>Deal Poker</i> (58.3 vs. 42.0), and full
            programs beat natural-language subgoals on 7 of 8 tasks.
          </p>
          <GroupedBars caption={<>Impact of code label content.</>} figureNumber={10} series={ABL_LABEL} showValues={false} yMin={0} />
          <p>
            <strong>How does joint denoising affect performance and efficiency?</strong> Compared with generating code
            autoregressively before the video and action (teacher-forced AR), joint denoising wins on 7 of 8 tasks: early AR
            errors propagate into video prediction, while joint denoising refines the code alongside video and actions. It
            is also faster.
          </p>
          <TaskTable caption={<>Table 3: Impact of the code generation paradigm. Average rubric score (%).</>} label="Paradigm" rows={ABL_GENERATION} />
          <LatencyChart figureNumber={11} />

          {/* ---- Analysis ---- */}
          <h2 id="analysis">What code changes in the predicted future</h2>
          <p>
            Does the code stream change what the world model predicts? We compare future frames from the right wrist camera
            for AW-0, a variant that plans with natural-language subgoals (Subgoal), and a model without a planning stream
            (2-expert). For the instruction <i>&ldquo;Arrange the fruits so that finally there is only mango in the left
            bowl&rdquo;</i>, AW-0 directs the predicted interaction toward the mango, Subgoal hesitates between the apple and
            the mango, and 2-expert goes for the apple.
          </p>
          <figure className="aw-figure">
            <ZoomableImage
              alt="Future-frame prediction on Arrange Fruits"
              className="fig-img fig-img--pad"
              height={897}
              src={asset("/figures/video_pred_arrange_fruits.webp")}
              width={2600}
            />
            <figcaption>Figure 12: Future-frame prediction on <i>Arrange Fruits</i> for three models.</figcaption>
          </figure>
          <p>
            On the final stage of <i>Deal Poker</i>, where the right hand inserts a card into a narrow slot, AW-0 predicts the
            card aligning with and entering the slot, while Subgoal and 2-expert produce less coherent insertions with blur
            and distortion around the hand and card. Explicit skill calls and object arguments give the video expert a more
            specific condition, and the action expert in turn reads more reliable predictive features.
          </p>
          <figure className="aw-figure">
            <ZoomableImage
              alt="Future-frame prediction on Deal Poker"
              className="fig-img fig-img--pad"
              height={897}
              src={asset("/figures/video_pred_deal_poker.webp")}
              width={2600}
            />
            <figcaption>Figure 13: Future-frame prediction on <i>Deal Poker</i> for three models.</figcaption>
          </figure>

          {/* ---- Failures ---- */}
          <h2 id="failures">Failure cases</h2>
          <p>Six representative failures show where AW-0 still has headroom:</p>
          <FailureExplorer figureNumber={14} />

          {/* ---- Limitations ---- */}
          <h2 id="limitations">Limitations &amp; future work</h2>
          <ul>
            <li>
              <strong>Program grounding and skill coverage.</strong> Planning quality depends on annotation accuracy and
              skill coverage; a generated program can pick the right skill with the wrong arguments, so syntactic validity
              does not ensure correct execution. Execution feedback could improve grounding and grow the skill library.
            </li>
            <li>
              <strong>Predictive robustness and hybrid execution.</strong> Structured planning does not remove sensitivity to
              visual distribution shift, and hybrid execution trades clean-scene performance for robustness because the
              arbiter admits code on validity alone. Learning to arbitrate from execution reliability and expected progress
              could exploit both modes better.
            </li>
            <li>
              <strong>Toward continual agentic learning.</strong> Real-world hybrid evaluation is limited to YAM, as
              code-as-policy systems for dexterous hands are lacking, and the system does not yet learn online from its own
              interactions.
            </li>
          </ul>

          {/* ---- Conclusion ---- */}
          <h2 id="conclusion">Conclusion</h2>
          <p>
            AW-0 is an agentic world action model that integrates code-based skill planning with predictive dynamics and
            continuous control. Through joint denoising, the code expert provides structured semantic guidance for video and
            action generation, and an automated annotation pipeline lets this planning interface be learned from
            large-scale robot and human demonstrations. Experiments on RoboTwin 2.0 and on real-world manipulation with YAM
            and dexterous hands show gains in language following, semantic reasoning, and skill execution, with hybrid
            execution further improving robustness. These results lay a foundation for skill reuse and for iterative
            interaction between programmatic planning, world prediction, and execution in agentic systems that continually
            interact with and learn from their environments.
          </p>

          {/* ---- Citation (shown once BIBTEX is set in src/data/aw0.ts) ---- */}
          {BIBTEX ? (
            <>
              <h2 id="citation">Citation</h2>
              <p>If you find this work useful, please cite:</p>
              <CitationBibtex />
            </>
          ) : null}
          <p style={{ fontSize: 15, color: "var(--aw-muted)", marginTop: 48 }}>
            This project page is built on the open-source{" "}
            <a href="https://github.com/enpire-research/enpire-research.github.io" rel="noopener noreferrer" target="_blank">
              ENPIRE
            </a>{" "}
            project-page template — many thanks to its authors.
          </p>
        </article>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="figure-page" data-theme="day">
      <Hero />
      <ArticleContent />
    </main>
  );
}
