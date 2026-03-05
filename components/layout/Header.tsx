import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui";

const Header = () => {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center px-10">
        <h1 className="mr-20">
          <Link href="/" className="text-xl font-bold">
            DealFlow
          </Link>
        </h1>

        <NavigationMenu className="justify-around mr-auto">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/">홈</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/best">베스트</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <input
          type="text"
          placeholder="검색어를 입력하세요."
          className="rounded-full border px-4 py-2 text-sm"
          style={{ minWidth: "300px" }}
        />
      </div>
    </header>
  );
};

export default Header;
