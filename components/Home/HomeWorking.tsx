import { FaCog } from "react-icons/fa";
import MyBadge from "@/components/MyBadge";
import { Separator } from "@/components/ui/separator";
import { Fa1, Fa2, Fa3, Fa4, Fa5 } from "react-icons/fa6";

const HomeWorking = () => {
  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-4" id="howitworks">
      {/* content heading */}
      <div className="flex flex-col gap-6 justify-center items-center pt-14 pb-10">
        <MyBadge icon={FaCog} label="How It Works?" />

        <h2 className="order-two-heading text-center">
          Simple Steps To Follow
        </h2>
      </div>

      {/* WORKING GUIDE */}
      <div className="hidden md:flex gap-8 my-10">
        {/* steps left */}
        <div className="flex-1 grid grid-cols-1 grid-rows-5 gap-10 justify-items-center items-center">
          {/* 1 */}
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa1 />
          </div>

          {/* step 2 */}

          <div className="flex flex-col gap-2 text-right">
            <h4 className="order-four-heading">Step 2</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>

          {/* 3 */}
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa3 />
          </div>

          {/* step 4 */}
          <div className="flex flex-col gap-2 text-right">
            <h4 className="order-four-heading">Step 4</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>

          {/* 5 */}
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa5 />
          </div>
        </div>

        {/* separator */}
        <Separator orientation="vertical" />

        {/* steps right */}
        <div className="flex-1 grid grid-cols-1 grid-rows-5 gap-10 justify-items-center items-center">
          {/* step 1 */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="order-four-heading">Step 1</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>

          {/* 2 */}
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa2 />
          </div>

          {/* step 3 */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="order-four-heading">Step 3</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>

          {/* 4 */}
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa4 />
          </div>

          {/* step 5 */}
          <div className="flex flex-col gap-2 text-left">
            <h4 className="order-four-heading">Step 5</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>
        </div>
      </div>

      {/* working guide mobile */}
      <div className="md:hidden flex flex-col my-6">
        {/* step 1 */}
        <div className="flex gap-4 my-4">
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa1 />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <h4 className="order-four-heading">Step 1</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>
        </div>

        <Separator />

        {/* step 2 */}
        <div className="flex gap-4 my-4">
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa2 />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <h4 className="order-four-heading">Step 2</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>
        </div>

        <Separator />

        {/* step 3 */}
        <div className="flex gap-4 my-4">
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa3 />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <h4 className="order-four-heading">Step 3</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>
        </div>

        <Separator />

        {/* step 4 */}
        <div className="flex gap-4 my-4">
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa4 />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <h4 className="order-four-heading">Step 4</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>
        </div>

        <Separator />

        {/* step 5 */}
        <div className="flex gap-4 my-4">
          <div className="rounded-full size-12 bg-secondary text-foreground border border-border flex justify-center items-center content-center text-xl shrink-0 overflow-hidden">
            <Fa5 />
          </div>

          <div className="flex flex-col gap-2 text-left">
            <h4 className="order-four-heading">Step 5</h4>

            <p className="description-text">
              Description Lorem ipsum dolor, sit amet consectetur adipisicing
              elit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeWorking;
