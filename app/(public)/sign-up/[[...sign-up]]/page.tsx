import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <SignUp 
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/app"
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


