import Link from "next/link";

export default function IndexPage() {
  return (
    <div>
      Hello.{" "}
      <Link href="/about">
        <a>About</a>
      </Link>
    </div>
  );
}
