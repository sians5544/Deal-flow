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
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-8 lg:h-16 lg:flex-nowrap lg:px-[120px] lg:py-0">
        <h1 className="lg:mr-14">
          <Link href="/" className="text-xl font-bold">
            DealFlow
          </Link>
        </h1>

        <NavigationMenu className="justify-around mr-auto">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className="whitespace-nowrap" href="/">
                홈
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="whitespace-nowrap" href="/best">
                베스트
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="whitespace-nowrap" href="/today">
                오늘의 딜
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <input
          type="text"
          placeholder="검색어를 입력하세요."
          className="order-last w-full rounded-full border px-4 py-2 text-sm lg:order-none lg:w-auto lg:min-w-[300px]"
        />
      </div>
    </header>
  );
};

export default Header;
