# Context

<aside>
💡 What’s the issue motivating this decision or change ?

Our CI/CD foundation is in place with Expo/EAS build profiles, PR E2E workflows, and release runbooks, but cloud workflow usage can consume credits quickly when developers use CI as a first-step validator for routine local changes.

We need a clear operating model that protects velocity and keeps costs predictable while still preserving reliable release automation.

</aside>

# Proposal

<aside>
💡 What is the change that we're proposing and/or doing?

Adopt a local-first CI/CD operating policy:

1. Validate locally first for day-to-day development:
   - `npm run typecheck`
   - `npm run ios` or `npm run android`
   - local Maestro flows when a task touches critical paths
2. Use EAS cloud workflows for shared proof and release operations:
   - PR E2E evidence through existing `.eas/workflows/e2e-test-android.yml` and `.eas/workflows/e2e-test-ios.yml`
   - release submissions through manual workflows:
     - `.eas/workflows/submit-ios.yml`
     - `.eas/workflows/submit-android.yml`
3. Keep release submission execution with release-owner control (`workflow_dispatch`) to prevent accidental store submissions and unnecessary reruns.
4. Standardize CI/CD identity on a shared organization-owned Expo/EAS service account for cloud builds, submissions, and workflow operations.
5. Store service-account credentials and tokens only in org secret managers, with named ownership and periodic rotation.

</aside>

# Impact

<aside>
💡 What becomes easier or more difficult to do because of this change?

Easier:
- teams can ship with clear release automation and predictable cloud usage
- contributors know exactly when local checks are sufficient versus when cloud evidence is required

More difficult:
- release owners must follow a stricter checklist and avoid ad-hoc reruns
- teams need discipline to run local checks before requesting cloud workflows

</aside>

## 👍 Benefits

1. **Benefit:** Reduces EAS credit burn by moving routine validation to local commands.
2. **Benefit:** Preserves strong release automation through explicit submit workflows.
3. **Benefit:** Improves operational clarity with a single local-first policy across engineering and QA.
4. **Benefit:** Keeps production submissions intentional via manual release-owner triggers.
5. **Benefit:** Removes personal-account dependency and improves continuity for release operations.
6. **Benefit:** Improves auditability because cloud actions are tied to one controlled org identity.

## ❗ Risks and how to Mitigate them

1. **Risk 1:** Developers may skip cloud E2E when it is still required for shared confidence.

**Mitigation:** Keep PR and release gates explicit in runbooks and task acceptance criteria, including required workflow evidence before promotion.

2. **Risk 2:** Manual submit triggers can delay releases if ownership is unclear.

**Mitigation:** Keep release-owner assignment mandatory per release and track workflow run IDs in the release audit log.

3. **Risk 3:** Local environments vary and may hide issues that only appear in cloud infrastructure.

**Mitigation:** Continue running cloud E2E on shared branches and require green production submit workflow evidence before final promotion.

4. **Risk 4:** Shared-account credentials can become a single high-impact target.

**Mitigation:** Enforce least privilege, secret vault storage, MFA where supported, short-lived tokens where possible, and a mandatory credential rotation cadence with documented incident response steps.
