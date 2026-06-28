# AUTHENTICATION FLOW REPORT

## Overview
The Authentication Gate is the critical first barrier that ensures judges and general evaluators do not accidentally enter the real application. It seamlessly intercepts the user after the initial splash animation.

## Implementation Details
1. **JudgeEntryModal**: A full-screen, visually striking modal that presents two distinct pathways: `[ LOGIN WITH GOOGLE ]` for actual users and `[ ENTER JUDGE MODE ]` for evaluators.
2. **URL-Based Deep Linking**: We implemented `?mode=judge` detection in `StartupWrapper.tsx`. If this parameter is present, the system bypasses the authentication gate entirely, silently drops the user into Judge Mode, and immediately initializes the guided tour.
3. **State Management**: Authentication state and Judge Mode status are decoupled. A user in Judge Mode explicitly lacks standard authentication credentials, effectively sandboxing them.

## Impact
This flow eliminates the "empty state" problem for evaluators. By providing a one-click entry point into a fully populated, interactive demo environment, the time-to-value for judges is reduced to zero.
