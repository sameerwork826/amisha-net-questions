import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

/** Sign-in button (signed out) / avatar menu (signed in). Render only when
 *  Clerk is enabled, i.e. inside <ClerkProvider>. */
export default function AuthControls() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="btn btn-primary px-3 py-1.5">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}
