# Agent Schedule

This document outlines the scheduling for automated tasks. As of 2026-02-13, a "Guarded Cron Pattern" is used for high-frequency tasks to minimize costs.

## 1. System Cron (`crontab`) - Zero-Cost Polling

A system-level cron (`crontab -l`) runs lightweight shell scripts to check for work. These checks do **not** involve an LLM and have zero token cost. They run frequently to ensure low latency.

| Schedule      | Command                                                              | Purpose                                                 |
| :------------ | :------------------------------------------------------------------- | :------------------------------------------------------ |
| `*/2 * * * *` | `/root/queue-guards/check-queue.sh ... mail-write`                   | Checks `mail-write-queue.json` for pending emails.      |
| `*/2 * * * *` | `/root/queue-guards/check-queue.sh ... x-write`                      | Checks `x-write-queue.json` for pending tweets/replies. |
| `*/5 * * * *` | `/root/queue-guards/check-signals.sh`                                | Checks `status-signals.json` for new achievements.      |

If a guard script finds work, it immediately triggers the corresponding (disabled) OpenClaw job below.

## 2. OpenClaw Cron - Triggered & Scheduled Tasks

These are `agentTurn` jobs managed by OpenClaw.

### On-Demand Jobs (Triggered by Guards)

These jobs are `enabled: false` and have no active schedule. They only run when called by a guard script.

| Job Name        | Model | Triggered By              | Purpose                                 |
| :-------------- | :---- | :------------------------ | :-------------------------------------- |
| `mail-write`    | `gpt` | `check-queue.sh`          | Processes the mail queue and sends emails. |
| `x-write`       | `opus`| `check-queue.sh`          | Processes the tweet queue and posts to X. |
| `status-update` | `gpt` | `check-signals.sh`        | Posts a new achievement to the website. |

### Scheduled Jobs

These jobs run on a fixed schedule defined within OpenClaw.

| Job Name               | Model | Schedule              | Purpose                                                                 |
| :--------------------- | :---- | :-------------------- | :---------------------------------------------------------------------- |
| `daily-backup`         | `gpt` | Daily at 05:00 CET    | Runs the daily workspace backup script.                                 |
| `daily-cost-report`    | `gpt` | Daily at 00:05 UTC    | Sends an email report of the previous day's API costs.                  |
| `daily-learning`       | `gpt` | Daily at 06:30 UTC    | Reads news/RSS, updates the knowledge base, and seeds content queues.   |
| `daily-blog`           | `opus`| Daily at 08:00 UTC    | Writes and publishes a new blog post.                                   |
| `social-daily-review`  | `gpt` | Daily at 19:00 UTC    | Reviews social media engagement and updates experiment tracking.        |
| `social-weekly-review` | `gpt` | Weekly (Sun 10:00 UTC)| Performs a strategic review of the week's social media activities.      |
| `social-research`      | `gpt` | Mon & Thu at 14:00 UTC| Researches topics and defines new social media experiments.             |
| `mail-read`            | `gpt` | Every 15 minutes      | Checks for new emails and populates the `mail-write` queue.             |
| `x-read`               | `gpt` | Every 4 hours         | Reads the X timeline, performs engagement actions, and seeds the queue. |
| `memory-retro`         | `gpt` | Every 6 hours         | Distills recent daily logs into long-term `MEMORY.md`.                  |
