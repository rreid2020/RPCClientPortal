import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <SignIn 
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/select-org"
          appearance={{
            elements: {
              rootBox: "mx-auto",
            },
          }}
        />
      </div>
    </div>
  )
}
