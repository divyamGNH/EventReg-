import Dashboard_Filter from "@/components/Dashboard_Filter";
import Popup_Filter from "@/components/Popup_Filter";
import UserNavBar from "@/components/UserNavBar";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";
import { RxHamburgerMenu } from "react-icons/rx";

function UserDashboard() {
    const router = useRouter();

    const [allEvents, setAllEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [popupFilterOpen, setPopupFilterOpen] = useState(false);

    const [filterOptions, setFilterOptions] = useState({
        keyword: "",
        category: "",
        dateRange: "",
        price: [10, 3000],
    });

    const fetchAllEvents = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/getallevents`
            );

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            setAllEvents(data || []);
            setFilteredEvents(data || []);
        } catch (error) {
            console.error("Failed to fetch events:", error);
            setAllEvents([]);
            setFilteredEvents([]);
        }
    };

    useEffect(() => {
        fetchAllEvents();
    }, []);

    useEffect(() => {
        const newFilteredEvents = allEvents.filter((event) => {
            if (!event) return false;

            if (
                filterOptions.keyword &&
                (!event.name ||
                    !event.name
                        .toLowerCase()
                        .includes(filterOptions.keyword.toLowerCase()))
            ) {
                return false;
            }

            if (filterOptions.dateRange && event.date) {
                const dateParts = event.date.split("/");
                const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

                if (formattedDate < filterOptions.dateRange) {
                    return false;
                }
            }

            if (event.price != null) {
                if (
                    event.price < filterOptions.price[0] ||
                    event.price > filterOptions.price[1]
                ) {
                    return false;
                }
            }

            return true;
        });

        setFilteredEvents(newFilteredEvents);
    }, [allEvents, filterOptions]);

    const handleFilterClear = () => {
        setFilterOptions({
            keyword: "",
            category: "",
            dateRange: "",
            price: [10, 3000],
        });

        setFilteredEvents(allEvents);
        setPopupFilterOpen(false);
    };

    return (
        <div className="pt-20 lg:pt-8 bg-[color:var(--primary-color)]">
            <UserNavBar />

            <div className="flex m-auto">
                <div className="flex mx-auto container">
                    <div className="flex m-auto gap-4 lg:gap-8 w-full h-[calc(88vh)]">

                        {/* Desktop Filter */}
                        <div className="hidden md:flex flex-col p-4 sticky top-0 w-1/6 md:w-1/4">
                            <Dashboard_Filter
                                filterOptions={filterOptions}
                                setFilterOptions={setFilterOptions}
                                handleFilterClear={handleFilterClear}
                            />
                        </div>

                        {/* Mobile Filter Popup */}
                        {popupFilterOpen && (
                            <div className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-50 flex items-center justify-center">
                                <div className="bg-white rounded-lg p-4 w-5/6">
                                    <Popup_Filter
                                        filterOptions={filterOptions}
                                        setFilterOptions={setFilterOptions}
                                        handleFilterClear={handleFilterClear}
                                        handleClose={() =>
                                            setPopupFilterOpen(false)
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        {/* Main Dashboard */}
                        <div className="flex w-full md:w-3/4 mx-auto justify-between container">
                            <div className="p-4 overflow-y-auto w-full h-[calc(80vh)]">
                                <h2 className="text-lg font-medium mb-4">
                                    Events
                                </h2>

                                {filteredEvents.length === 0 ? (
                                    <div className="flex items-center justify-center h-64 text-gray-500">
                                        No events yet
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {filteredEvents.map((event) => (
                                            <div
                                                key={event._id}
                                                onClick={() =>
                                                    router.push(
                                                        `/event/${event.event_id}`
                                                    )
                                                }
                                                className="hover:scale-105 cursor-pointer transition-all mt-5 bg-[color:var(--white-color)] rounded-lg shadow-md px-3 py-3"
                                            >
                                                <div className="relative h-[25rem]">
                                                    {event.profile && (
                                                        <Image
                                                            fill
                                                            className="object-cover h-full w-full rounded-md"
                                                            src={event.profile}
                                                            alt="event image"
                                                            sizes="(min-width: 640px) 100vw, 50vw"
                                                            priority
                                                        />
                                                    )}
                                                </div>

                                                <div className="flex flex-row justify-between items-start mt-4">
                                                    <div className="px-2">
                                                        <p className="text-sm text-gray-800 font-bold">
                                                            {event.name
                                                                ? event.name.length >
                                                                  30
                                                                    ? event.name.slice(
                                                                          0,
                                                                          30
                                                                      ) + "..."
                                                                    : event.name
                                                                : "Unnamed Event"}
                                                        </p>

                                                        <p className="text-sm text-gray-800">
                                                            {event.venue || "Unknown Venue"}
                                                        </p>

                                                        <p className="text-sm text-gray-800">
                                                            {event.date || "No Date"}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col justify-end items-center">
                                                        <span className="w-full flex flex-row items-center">
                                                            <FaUsers />
                                                            <span className="ml-2 text-sm">
                                                                4,92
                                                            </span>
                                                        </span>

                                                        <p className="text-sm text-gray-800 mt-2">
                                                            <strong className="whitespace-nowrap">
                                                                ₹ {event.price ?? 0}
                                                            </strong>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Filter Button */}
                        <div className="fixed bottom-3 right-3">
                            <button
                                onClick={() => setPopupFilterOpen(true)}
                                className="md:hidden flex items-center justify-center w-[4rem] h-[4rem] text-white rounded-full bg-[color:var(--darker-secondary-color)] hover:bg-[color:var(--secondary-color)] hover:scale-105 shadow-lg cursor-pointer transition-all ease-in-out focus:outline-none"
                                title="Filter Events"
                            >
                                <RxHamburgerMenu className="w-6 h-6" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserDashboard;