package com.atinroy.orderly.restaurant.service;

import com.atinroy.orderly.coupon.model.Coupon;
import com.atinroy.orderly.coupon.repository.CouponRepository;
import com.atinroy.orderly.order.mapper.OrderMapper;
import com.atinroy.orderly.order.model.Order;
import com.atinroy.orderly.order.model.OrderItem;
import com.atinroy.orderly.order.model.OrderStatus;
import com.atinroy.orderly.order.model.OrderTimeline;
import com.atinroy.orderly.order.repository.OrderRepository;
import com.atinroy.orderly.order.service.OrderSimulationService;
import com.atinroy.orderly.restaurant.model.MenuItem;
import com.atinroy.orderly.restaurant.model.Restaurant;
import com.atinroy.orderly.restaurant.repository.RestaurantRepository;
import com.atinroy.orderly.user.model.DeliveryPartnerProfile;
import com.atinroy.orderly.user.model.Role;
import com.atinroy.orderly.user.model.User;
import com.atinroy.orderly.user.model.UserAddress;
import com.atinroy.orderly.user.repository.DeliveryPartnerProfileRepository;
import com.atinroy.orderly.user.repository.UserAddressRepository;
import com.atinroy.orderly.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private static final String DEMO_PASSWORD = "orderly-demo";

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final UserAddressRepository userAddressRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderSimulationService orderSimulationService;

    @Override
    public void run(String... args) {
        User demoCustomer = ensureUser("demo.customer@orderly.local", "Aditi Sen", "+919830100100", Role.USER);
        User demoOwner = ensureUser("demo.owner@orderly.local", "Ritwik Ghosh", "+919830100101", Role.BUSINESS);
        ensureUser("demo.admin@orderly.local", "Professor Demo", "+919830100103", Role.ADMIN);
        ensureDeliveryPartners();
        ensureCoupons();

        seedRestaurants(demoOwner);

        if (!userAddressRepository.existsByUserId(demoCustomer.getId())) {
            seedCustomerAddresses(demoCustomer);
        }

        if (orderRepository.findFirstByUserIdAndStatusInOrderByCreatedDateDesc(
                demoCustomer.getId(),
                List.of(
                        OrderStatus.PLACED,
                        OrderStatus.ACCEPTED,
                        OrderStatus.PREPARING,
                        OrderStatus.READY,
                        OrderStatus.PICKED_UP,
                        OrderStatus.DELIVERED,
                        OrderStatus.CANCELLED
                )
        ).isEmpty()) {
            seedDemoOrders(demoCustomer);
        }
    }

    private void seedRestaurants(User owner) {
        List<RestaurantSeed> seeds = List.of(
                restaurant("Oudh & Co.", "Park Street", "North Indian Signatures", "Slow-cooked biryanis, kebabs, and rich Mughlai plates tuned for dinner cravings.", 4.8, 34, 49, "north-indian", "bg-gradient-to-br from-orange-500 via-amber-500 to-red-700", northIndianMenu()),
                restaurant("Ballygunge Biryani Club", "Ballygunge", "Awadhi Biryani", "Fragrant rice, tender meats, and celebratory handi portions with classic Kolkata add-ons.", 4.7, 31, 39, "biryani", "bg-gradient-to-br from-yellow-700 via-orange-700 to-stone-900", biryaniMenu()),
                restaurant("Gariahat Roll Room", "Gariahat", "Rolls & Kebabs", "Kathi rolls, smoky kebabs, and fast evening combos built for street-food orders.", 4.6, 24, 19, "rolls", "bg-gradient-to-br from-fuchsia-700 via-rose-600 to-orange-500", rollsMenu()),
                restaurant("Salt Lake Tiffin House", "Salt Lake Sector 1", "South Indian Comfort", "Crisp dosas, podi-heavy tiffins, and coffee-led breakfast-to-dinner comfort meals.", 4.8, 29, 25, "south-indian", "bg-gradient-to-br from-lime-600 via-green-700 to-emerald-900", southIndianMenu()),
                restaurant("Sector V Bowl Company", "Salt Lake Sector 5", "Asian Bowls & Quick Meals", "Office-friendly rice bowls, chilli gravies, and snackable sides for tech-park rush hours.", 4.5, 22, 29, "asian", "bg-gradient-to-br from-cyan-700 via-sky-600 to-blue-900", asianMenu()),
                restaurant("New Town Kosha Kitchen", "New Town", "Bengali Specials", "Kosha mangsho, fish curries, and rice plates rooted in Kolkata comfort food.", 4.7, 36, 35, "bengali", "bg-gradient-to-br from-rose-700 via-orange-700 to-amber-500", bengaliMenu()),
                restaurant("Rajarhat Grill Garden", "Rajarhat", "Charcoal Grills", "Grilled platters, butter naan, and North Indian family-style dinner spreads.", 4.6, 33, 49, "grill", "bg-gradient-to-br from-stone-900 via-orange-700 to-yellow-600", grillMenu()),
                restaurant("Bhawanipur Chaat Gallery", "Bhawanipur", "Chaat & Snacks", "Tangy chaats, papdi plates, and snacky add-ons built for late-afternoon ordering.", 4.4, 20, 15, "chaat", "bg-gradient-to-br from-pink-500 via-rose-500 to-red-700", chaatMenu()),
                restaurant("Alipore Mithai Bureau", "Alipore", "Sweets & Desserts", "Rosogolla tins, mishti assortments, and dessert boxes for gifting and post-dinner cravings.", 4.7, 28, 25, "desserts", "bg-gradient-to-br from-pink-400 via-rose-500 to-orange-500", dessertMenu()),
                restaurant("Park Circus Rezala House", "Park Circus Area", "Mughlai Classics", "Rezala, chaap, rumali roti, and rich Mughlai staples for substantial evening orders.", 4.8, 35, 45, "mughlai", "bg-gradient-to-br from-amber-600 via-orange-700 to-stone-900", mughlaiMenu()),
                restaurant("Minto Park Salad & Grill", "Park Street", "Healthy Bowls", "Protein bowls, grilled sides, and fresh salads that still feel satisfying at delivery pace.", 4.3, 19, 25, "healthy", "bg-gradient-to-br from-emerald-600 via-teal-600 to-lime-500", healthyMenu()),
                restaurant("Lake Market Wok Lab", "Ballygunge", "Chinese Comfort", "Hakka noodles, chilli chicken, and Indo-Chinese comfort plates for group ordering.", 4.5, 27, 29, "chinese", "bg-gradient-to-br from-red-700 via-orange-600 to-yellow-500", chineseMenu()),
                restaurant("Quest Mall Dum Stories", "Park Street", "Biryani & Kebabs", "Dinner-friendly biryani handi, kebab platters, and festive rice boxes.", 4.7, 30, 39, "biryani", "bg-gradient-to-br from-orange-500 via-red-600 to-stone-900", biryaniMenu()),
                restaurant("Golpark Dosa Circuit", "Gariahat", "Dosas & Tiffins", "Reliable crispy dosas, mini tiffins, and chutney-heavy combos for all-day comfort.", 4.6, 26, 19, "south-indian", "bg-gradient-to-br from-green-600 via-emerald-700 to-teal-900", southIndianMenu()),
                restaurant("Eco Park Bento Stop", "New Town", "Asian Bowls & Sushi-ish", "Fast rice bowls, stir-fries, and bento-like combos for office dinner runs.", 4.4, 23, 29, "asian", "bg-gradient-to-br from-sky-600 via-cyan-600 to-indigo-900", asianMenu()),
                restaurant("Nicco Park Kebab Yard", "Salt Lake Sector 1", "Kebabs & North Indian", "Skewers, roomali, and smoky mains designed for big shared orders.", 4.6, 30, 35, "grill", "bg-gradient-to-br from-orange-700 via-red-700 to-stone-950", grillMenu()),
                restaurant("City Centre Chaat Counter", "Salt Lake Sector 1", "Chaat & Fast Bites", "Crowd-pleasing chaats, fries, and wraps designed for snack cravings.", 4.3, 18, 15, "chaat", "bg-gradient-to-br from-rose-500 via-fuchsia-500 to-orange-500", chaatMenu()),
                restaurant("Prinsep Sweet Studio", "Alipore", "Dessert Boxes", "Curated sweets, rabri desserts, and chilled Bengali classics for easy gifting.", 4.8, 25, 25, "desserts", "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400", dessertMenu()),
                restaurant("Camac Street Kosha Room", "Park Street", "Bengali Classics", "Kosha gravies, fish fries, and heritage-style rice meals adapted for delivery.", 4.7, 32, 35, "bengali", "bg-gradient-to-br from-red-800 via-amber-700 to-yellow-500", bengaliMenu()),
                restaurant("Quest Greens Kitchen", "Bhawanipur", "Healthy Bowls & Wraps", "Fresh bowls, grilled wraps, and lighter comfort food for weekday lunch orders.", 4.4, 21, 19, "healthy", "bg-gradient-to-br from-lime-500 via-emerald-600 to-teal-700", healthyMenu()),
                restaurant("Biswa Bangla Wok Street", "Rajarhat", "Chinese Comfort", "Saucy gravies, fried rice, and crispy starters for family sharing.", 4.5, 28, 29, "chinese", "bg-gradient-to-br from-red-700 via-orange-700 to-amber-500", chineseMenu()),
                restaurant("Acropolis Roll Foundry", "Ballygunge", "Rolls & Fast Combos", "Loaded wraps, kebab rolls, and fast sides built for late-night hunger.", 4.6, 22, 19, "rolls", "bg-gradient-to-br from-violet-700 via-rose-600 to-orange-500", rollsMenu()),
                restaurant("Park Circus Nizam Table", "Park Circus Area", "Mughlai & Rezala", "Soft rumali, buttery curries, and rezala plates with classic Kolkata richness.", 4.8, 34, 45, "mughlai", "bg-gradient-to-br from-orange-700 via-amber-600 to-stone-950", mughlaiMenu()),
                restaurant("DLF Tiffin Hub", "New Town", "South Indian & Bowls", "Fast dosa bowls, idli combos, and coffee for workday breakfast and lunch runs.", 4.5, 24, 19, "south-indian", "bg-gradient-to-br from-emerald-700 via-green-600 to-lime-500", southIndianMenu()),
                restaurant("Howrah Steam Box", "Howrah", "Bengali Bento", "Railway-side comfort plates, fish fries, and packed meals that still travel well.", 4.4, 32, 29, "bengali", "bg-gradient-to-br from-amber-700 via-orange-700 to-red-800", bengaliMenu()),
                restaurant("Esplanade Kebab Press", "Esplanade", "Rolls & Kebabs", "Fast-grab kebab wraps and charcoal-finished late-evening plates.", 4.6, 25, 19, "rolls", "bg-gradient-to-br from-red-700 via-rose-600 to-orange-500", rollsMenu()),
                restaurant("Southern Avenue Salad Club", "Southern Avenue", "Healthy Bowls", "Lake-side grain bowls, wraps, and lighter comfort meals built for repeat ordering.", 4.3, 20, 19, "healthy", "bg-gradient-to-br from-green-600 via-emerald-700 to-lime-500", healthyMenu()),
                restaurant("Behala Biryani Works", "Behala", "Biryani Classics", "Comfort biryani handi, chaap sides, and celebratory combos for family dinners.", 4.5, 33, 39, "biryani", "bg-gradient-to-br from-yellow-700 via-orange-700 to-stone-900", biryaniMenu())
        );

        for (RestaurantSeed seed : seeds) {
            if (restaurantRepository.findBySlug(slugify(seed.name())).isPresent()) {
                continue;
            }

            Restaurant restaurant = new Restaurant();
            restaurant.setOwner(owner);
            restaurant.setName(seed.name());
            restaurant.setSlug(slugify(seed.name()));
            restaurant.setDescription(seed.description());
            restaurant.setCuisineType(seed.cuisineType());
            restaurant.setCity("Kolkata");
            restaurant.setLocality(seed.locality());
            restaurant.setImageUrl("/demo/restaurants/" + seed.imageKey() + ".svg");
            restaurant.setRating(seed.rating());
            restaurant.setDeliveryTimeMinutes(seed.deliveryTimeMinutes());
            restaurant.setDeliveryFee(seed.deliveryFee());
            restaurant.setIsApproved(true);
            restaurant.setIsActive(true);
            restaurant.setImageColor(seed.imageColor());

            int order = 1;
            for (MenuSeed menuSeed : seed.menu()) {
                MenuItem item = new MenuItem();
                item.setRestaurant(restaurant);
                item.setName(menuSeed.name());
                item.setDescription(menuSeed.description());
                item.setImageUrl("/demo/dishes/" + categoryImageKey(menuSeed.category()) + ".svg");
                item.setPrice(menuSeed.price());
                item.setCategory(menuSeed.category());
                item.setIsAvailable(true);
                item.setIsVeg(menuSeed.veg());
                item.setSortOrder(order);
                order += 1;
                restaurant.getMenuItems().add(item);
            }

            restaurantRepository.save(restaurant);
        }
    }

    private void seedCustomerAddresses(User customer) {
        List<AddressSeed> addresses = List.of(
                new AddressSeed("Home", "18B Hindustan Park Road", "3rd Floor, near Basanti Devi College", "Kolkata", "+919830100100", 22.5173, 88.3645, true),
                new AddressSeed("Work", "DLF IT Park, Tower 2", "5th floor reception", "Kolkata", "+919830100100", 22.5798, 88.4625, false),
                new AddressSeed("Parents", "12A Ballygunge Place", "Opposite Gurusaday Road", "Kolkata", "+919830100100", 22.5251, 88.3692, false)
        );

        for (AddressSeed seed : addresses) {
            UserAddress address = new UserAddress();
            address.setUser(customer);
            address.setLabel(seed.label());
            address.setAddress(seed.address());
            address.setBuildingInfo(seed.buildingInfo());
            address.setCity(seed.city());
            address.setPhone(seed.phone());
            address.setLatitude(seed.latitude());
            address.setLongitude(seed.longitude());
            address.setDefault(seed.isDefault());
            userAddressRepository.save(address);
        }
    }

    private void seedDemoOrders(User customer) {
        Map<String, Restaurant> restaurantsByName = new LinkedHashMap<>();
        restaurantRepository.findAll().forEach(restaurant -> restaurantsByName.put(restaurant.getName(), restaurant));

        UserAddress primaryAddress = userAddressRepository.findByUserIdAndIsDefaultTrue(customer.getId())
                .orElseGet(() -> userAddressRepository.findByUserId(customer.getId()).stream().findFirst().orElseThrow());

        createOrder(customer, primaryAddress, restaurantsByName.get("Oudh & Co."), OrderStatus.PICKED_UP, "UPI", "RAZORPAY_FAKE", "AUTHORIZED", "pay_PK001", "rzp_PK001", 0, List.of(
                line("Kolkata Saffron Biryani", 1, 459),
                line("Mutton Galouti Sliders", 1, 329),
                line("Roomali Roti Basket", 1, 119)
        ));
        createOrder(customer, primaryAddress, restaurantsByName.get("Salt Lake Tiffin House"), OrderStatus.DELIVERED, "Card", "RAZORPAY_FAKE", "CAPTURED", "pay_DL002", "rzp_DL002", 4, List.of(
                line("Ghee Podi Dosa", 1, 229),
                line("Mini Tiffin Tray", 1, 289),
                line("Filter Coffee", 2, 79)
        ));
        createOrder(customer, primaryAddress, restaurantsByName.get("New Town Kosha Kitchen"), OrderStatus.DELIVERED, "UPI", "RAZORPAY_FAKE", "CAPTURED", "pay_DL003", "rzp_DL003", 8, List.of(
                line("Kosha Mangsho Meal", 1, 389),
                line("Bhetki Fry", 1, 279),
                line("Basanti Pulao", 1, 219)
        ));
        createOrder(customer, primaryAddress, restaurantsByName.get("Bhawanipur Chaat Gallery"), OrderStatus.DELIVERED, "UPI", "RAZORPAY_FAKE", "CAPTURED", "pay_DL004", "rzp_DL004", 12, List.of(
                line("Tok Jhal Phuchka Kit", 1, 129),
                line("Dahi Papdi Chaat", 1, 149),
                line("Masala Kulcha Plate", 1, 169)
        ));
        createOrder(customer, primaryAddress, restaurantsByName.get("Park Circus Rezala House"), OrderStatus.DELIVERED, "Card", "RAZORPAY_FAKE", "CAPTURED", "pay_DL005", "rzp_DL005", 16, List.of(
                line("Chicken Rezala", 1, 349),
                line("Mutton Chaap", 1, 319),
                line("Rumali Roti", 2, 49)
        ));
        createOrder(customer, primaryAddress, restaurantsByName.get("Prinsep Sweet Studio"), OrderStatus.DELIVERED, "UPI", "RAZORPAY_FAKE", "CAPTURED", "pay_DL006", "rzp_DL006", 20, List.of(
                line("Baked Rosogolla Tin", 1, 299),
                line("Nolen Gur Cheesecake Jar", 1, 189),
                line("Mishti Doi Tub", 1, 129)
        ));
        createOrder(customer, primaryAddress, restaurantsByName.get("Lake Market Wok Lab"), OrderStatus.CANCELLED, "Card", "RAZORPAY_FAKE", "REFUNDED", "pay_CN007", "rzp_CN007", 25, List.of(
                line("Chilli Chicken", 1, 269),
                line("Hakka Noodles", 1, 229),
                line("Crispy Chilli Babycorn", 1, 199)
        ));
    }

    private void createOrder(
            User customer,
            UserAddress address,
            Restaurant restaurant,
            OrderStatus status,
            String paymentMethod,
            String paymentProvider,
            String paymentStatus,
            String gatewayOrderId,
            String gatewayPaymentId,
            int daysAgo,
            List<OrderLineSeed> items
    ) {
        if (restaurant == null) {
            return;
        }

        int subtotal = items.stream().mapToInt(item -> item.price() * item.quantity()).sum();
        int deliveryFee = restaurant.getDeliveryFee();
        int platformFee = 12;
        int taxes = Math.round(subtotal * 0.05f);
        int total = subtotal + deliveryFee + platformFee + taxes;
        LocalDateTime createdAt = LocalDateTime.now().minusDays(daysAgo).withHour(19).withMinute(10 + (daysAgo % 30));

        Order order = new Order();
        order.setUser(customer);
        order.setRestaurant(restaurant);
        order.setStatus(status);
        order.setDeliveryAddress(address.getAddress() + ", " + address.getBuildingInfo());
        order.setDeliveryCity(address.getCity());
        order.setDeliveryPhone(address.getPhone());
        order.setDeliveryLatitude(address.getLatitude());
        order.setDeliveryLongitude(address.getLongitude());
        order.setPaymentMethod(paymentMethod);
        order.setPaymentProvider(paymentProvider);
        order.setPaymentStatus(paymentStatus);
        order.setGatewayOrderId(gatewayOrderId);
        order.setGatewayPaymentId(gatewayPaymentId);
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setPlatformFee(platformFee);
        order.setTaxes(taxes);
        order.setDiscount(0);
        order.setTotalAmount(total);
        order.setEstimatedDeliveryMinutes(restaurant.getDeliveryTimeMinutes());
        order.setCreatedDate(createdAt);
        order.setLastModifiedDate(createdAt);
        orderSimulationService.assignDeliveryPartner(order);

        for (OrderLineSeed line : items) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItemName(line.name());
            orderItem.setMenuItemPrice(line.price());
            orderItem.setQuantity(line.quantity());
            order.getItems().add(orderItem);
        }

        List<OrderStatus> timelineStatuses = switch (status) {
            case PICKED_UP -> List.of(OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.PICKED_UP);
            case DELIVERED -> List.of(OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.PICKED_UP, OrderStatus.DELIVERED);
            case CANCELLED -> List.of(OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.CANCELLED);
            default -> List.of(status);
        };

        for (int i = 0; i < timelineStatuses.size(); i += 1) {
            OrderStatus timelineStatus = timelineStatuses.get(i);
            OrderTimeline timeline = new OrderTimeline();
            timeline.setOrder(order);
            timeline.setLabel(OrderMapper.statusLabel(timelineStatus));
            timeline.setTimestamp(createdAt.plusMinutes(i * 8L));
            order.getTimeline().add(timeline);
        }

        orderRepository.save(order);
    }

    private void ensureDeliveryPartners() {
        List<DeliveryPartnerSeed> partners = List.of(
                deliveryPartner("demo.delivery@orderly.local", "Sourav Pal", "+919830100102", "Scooter", "Morning rush", "Salt Lake Sector 1, Salt Lake Sector 5, New Town, Rajarhat", "4 years of app-based delivery across Salt Lake and New Town.", "/demo/partners/rider-scooter-a.svg"),
                deliveryPartner("demo.delivery2@orderly.local", "Imran Sheikh", "+919830100104", "Bike", "Lunch peak", "Park Street, Esplanade, Bhawanipur, Alipore", "3 years handling dense office and central-city routes.", "/demo/partners/rider-bike-a.svg"),
                deliveryPartner("demo.delivery3@orderly.local", "Kunal Das", "+919830100105", "Scooter", "Evening", "Ballygunge, Gariahat, Golpark, Southern Avenue", "5 years specializing in evening food delivery.", "/demo/partners/rider-scooter-b.svg"),
                deliveryPartner("demo.delivery4@orderly.local", "Priyanka Saha", "+919830100106", "E-bike", "Night shift", "New Town, Rajarhat, Salt Lake Sector 5", "Fast urban night-route specialist.", "/demo/partners/rider-bike-b.svg"),
                deliveryPartner("demo.delivery5@orderly.local", "Rahul Mondal", "+919830100107", "Bike", "Morning rush", "Howrah, Esplanade, Park Street", "Experienced mixed-side city rider.", "/demo/partners/rider-bike-c.svg"),
                deliveryPartner("demo.delivery6@orderly.local", "Ayesha Khan", "+919830100108", "Scooter", "Lunch peak", "Behala, Alipore, Bhawanipur", "Known for smooth lunch-hour apartment deliveries.", "/demo/partners/rider-scooter-c.svg"),
                deliveryPartner("demo.delivery7@orderly.local", "Sagnik Roy", "+919830100109", "Bike", "Evening", "Park Circus Area, Park Street, Ballygunge", "Handles dense evening restaurant clusters.", "/demo/partners/rider-bike-a.svg"),
                deliveryPartner("demo.delivery8@orderly.local", "Debosmita Kar", "+919830100110", "Scooter", "Night shift", "Gariahat, Ballygunge, Southern Avenue", "Late-night repeat-order specialist.", "/demo/partners/rider-scooter-a.svg"),
                deliveryPartner("demo.delivery9@orderly.local", "Arijit Paul", "+919830100111", "Bike", "Lunch peak", "New Town, DLF IT Park, Eco Park, Rajarhat", "Corporate lunch delivery specialist.", "/demo/partners/rider-bike-b.svg"),
                deliveryPartner("demo.delivery10@orderly.local", "Mousumi Dey", "+919830100112", "Scooter", "Morning rush", "Salt Lake Sector 1, Bidhannagar, New Town", "Breakfast and tiffin order specialist.", "/demo/partners/rider-scooter-b.svg"),
                deliveryPartner("demo.delivery11@orderly.local", "Nawab Ali", "+919830100113", "Bike", "Evening", "Park Circus Area, Bhawanipur, Alipore", "High-volume dinner route rider.", "/demo/partners/rider-bike-c.svg"),
                deliveryPartner("demo.delivery12@orderly.local", "Ria Ghosh", "+919830100114", "E-bike", "Lunch peak", "Esplanade, Park Street, Camac Street", "Office district dispatch specialist.", "/demo/partners/rider-bike-a.svg"),
                deliveryPartner("demo.delivery13@orderly.local", "Tanmay Bose", "+919830100115", "Scooter", "Night shift", "Behala, Howrah, Alipore", "Longer-route finisher for late orders.", "/demo/partners/rider-scooter-c.svg"),
                deliveryPartner("demo.delivery14@orderly.local", "Farhan Ahmed", "+919830100116", "Bike", "Evening", "Rajarhat, New Town, Salt Lake Sector 5", "Tech park evening delivery specialist.", "/demo/partners/rider-bike-b.svg"),
                deliveryPartner("demo.delivery15@orderly.local", "Shreya Mitra", "+919830100117", "Scooter", "Morning rush", "Kolkata, Park Street, Ballygunge, New Town", "Flexible city-wide backup partner for repeat demos.", "/demo/partners/rider-scooter-a.svg")
        );

        for (DeliveryPartnerSeed seed : partners) {
            User user = ensureUser(seed.email(), seed.name(), seed.phone(), Role.DELIVERY_PARTNER);
            if (deliveryPartnerProfileRepository.findByUserId(user.getId()) != null) {
                continue;
            }

            DeliveryPartnerProfile profile = new DeliveryPartnerProfile();
            profile.setUser(user);
            profile.setCity("Kolkata");
            profile.setVehicleType(seed.vehicleType());
            profile.setPreferredShift(seed.preferredShift());
            profile.setServiceZones(seed.serviceZones());
            profile.setDeliveryExperience(seed.deliveryExperience());
            profile.setAvatarUrl(seed.avatarUrl());
            deliveryPartnerProfileRepository.save(profile);
        }
    }

    private void ensureCoupons() {
        List<CouponSeed> coupons = List.of(
                new CouponSeed("CRAVINGS150", "Flat 150 off", "Valid on orders above 499 from select restaurants.", 150, 499, true),
                new CouponSeed("FEAST120", "Save 120 tonight", "Works on comfort meals and family combinations above 699.", 120, 699, true),
                new CouponSeed("DESSERT200", "Dessert run reward", "Spend 999 to unlock 200 off on larger evening orders.", 200, 999, false),
                new CouponSeed("LATENIGHT90", "Late night 90 off", "Available after 11 PM on orders above 399.", 90, 399, false)
        );

        for (CouponSeed seed : coupons) {
            if (couponRepository.existsByCodeIgnoreCase(seed.code())) {
                continue;
            }

            Coupon coupon = new Coupon();
            coupon.setCode(seed.code());
            coupon.setTitle(seed.title());
            coupon.setDescription(seed.description());
            coupon.setDiscountAmount(seed.discountAmount());
            coupon.setMinOrderAmount(seed.minOrderAmount());
            coupon.setEnabled(seed.enabled());
            couponRepository.save(coupon);
        }
    }

    private User ensureUser(String email, String name, String phone, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            user.setPhone(phone);
            user.setRole(role);
            return userRepository.save(user);
        });
    }

    private RestaurantSeed restaurant(
            String name,
            String locality,
            String cuisineType,
            String description,
            double rating,
            int deliveryTimeMinutes,
            int deliveryFee,
            String imageKey,
            String imageColor,
            List<MenuSeed> menu
    ) {
        return new RestaurantSeed(name, locality, cuisineType, description, rating, deliveryTimeMinutes, deliveryFee, imageKey, imageColor, menu);
    }

    private List<MenuSeed> northIndianMenu() {
        return List.of(
                menu("Kolkata Saffron Biryani", "Fragrant basmati biryani with saffron finish and potato.", "biryani", 459, "Mains", false),
                menu("Mutton Galouti Sliders", "Soft kebab sliders with mint chutney.", "kebab", 329, "Starters", false),
                menu("Paneer Lababdar", "Silky tomato gravy with charred paneer.", "curry", 289, "Curries", true),
                menu("Dal Makhani", "Slow-cooked black lentils with cream.", "dal", 239, "Curries", true),
                menu("Roomali Roti Basket", "Three roomali rotis for sharing.", "bread", 119, "Breads", true),
                menu("Butter Naan", "Tandoor naan brushed with butter.", "bread", 59, "Breads", true),
                menu("Chicken Tikka", "Charred chicken tikka with onion salad.", "kebab", 299, "Starters", false),
                menu("Aloo Jeera", "Dry cumin potatoes for a light side.", "veg-side", 149, "Sides", true),
                menu("Smoked Paneer Tikka", "Cottage cheese skewers with peppers.", "paneer", 269, "Starters", true),
                menu("Kesar Firni", "Chilled saffron rice pudding.", "dessert", 139, "Desserts", true),
                menu("Masala Chaas", "Spiced buttermilk.", "drink", 79, "Beverages", true),
                menu("Gulab Jamun Duo", "Two warm gulab jamuns.", "dessert", 109, "Desserts", true)
        );
    }

    private List<MenuSeed> biryaniMenu() {
        return List.of(
                menu("Kolkata Chicken Biryani", "Classic biryani with potato and egg.", "biryani", 349, "Biryani", false),
                menu("Kolkata Mutton Biryani", "Long-grain rice and slow-cooked mutton.", "biryani", 459, "Biryani", false),
                menu("Paneer Biryani", "Vegetarian handi biryani with fried onions.", "biryani", 299, "Biryani", true),
                menu("Chicken Chaap", "Rich nutty Mughlai side for biryani.", "mughlai", 269, "Sides", false),
                menu("Mutton Rezala", "Light aromatic rezala gravy.", "curry", 329, "Sides", false),
                menu("Aloo Bukhara Raita", "Cooling plum-flecked raita.", "raita", 89, "Accompaniments", true),
                menu("Firni Cup", "Slow-set creamy firni.", "dessert", 119, "Desserts", true),
                menu("Egg Devil", "Crumb-fried egg snack.", "snack", 89, "Starters", true),
                menu("Chicken Reshmi Kebab", "Creamy mild kebab skewers.", "kebab", 259, "Starters", false),
                menu("Veg Chaap Roll", "Mughlai soy chaap roll.", "roll", 169, "Rolls", true),
                menu("Nimbu Soda", "Fresh lime soda.", "drink", 69, "Beverages", true),
                menu("Shahi Tukda", "Rabri-topped bread dessert.", "dessert", 149, "Desserts", true)
        );
    }

    private List<MenuSeed> rollsMenu() {
        return List.of(
                menu("Double Egg Chicken Roll", "Classic Kolkata kathi roll.", "roll", 189, "Rolls", false),
                menu("Paneer Tikka Roll", "Smoky paneer roll with onions.", "roll", 179, "Rolls", true),
                menu("Mutton Seekh Roll", "Juicy seekh wrapped in lachha paratha.", "roll", 229, "Rolls", false),
                menu("Chicken Malai Kebab", "Creamy kebab bites.", "kebab", 259, "Starters", false),
                menu("Paneer Popcorn", "Crunchy paneer bites.", "paneer", 189, "Starters", true),
                menu("Peri Peri Fries", "Loaded fries with spice dusting.", "fries", 129, "Sides", true),
                menu("Mughlai Paratha", "Egg-stuffed Kolkata-style paratha.", "paratha", 159, "Snacks", false),
                menu("Veg Hakka Noodles", "Quick stir-fried noodles.", "noodles", 169, "Snacks", true),
                menu("Chicken Cheese Wrap", "Cheesy grill wrap.", "wrap", 199, "Rolls", false),
                menu("Mint Lemonade", "Fresh mint cooler.", "drink", 79, "Beverages", true),
                menu("Brownie Slice", "Single-serve brownie square.", "dessert", 99, "Desserts", true),
                menu("Chilli Garlic Dip", "Extra side dip.", "dip", 29, "Add-ons", true)
        );
    }

    private List<MenuSeed> southIndianMenu() {
        return List.of(
                menu("Ghee Podi Dosa", "Crisp dosa with podi and ghee.", "dosa", 229, "Dosas", true),
                menu("Mini Tiffin Tray", "Idli, vada, mini dosa, and pongal.", "tiffin", 289, "Combos", true),
                menu("Mysore Masala Dosa", "Spicy chutney-lined masala dosa.", "dosa", 249, "Dosas", true),
                menu("Curd Rice", "Comfort curd rice with tempering.", "rice", 159, "Rice", true),
                menu("Medu Vada", "Two crisp vadas with chutneys.", "vada", 119, "Sides", true),
                menu("Podi Idli", "Mini idlis tossed in podi masala.", "idli", 149, "Sides", true),
                menu("Filter Coffee", "Strong brass-filter coffee.", "coffee", 79, "Beverages", true),
                menu("Badam Milk", "Warm almond milk.", "drink", 99, "Beverages", true),
                menu("Vegetable Uttapam", "Soft uttapam with vegetables.", "uttapam", 219, "Dosas", true),
                menu("Tomato Rice", "Tangy South Indian rice.", "rice", 169, "Rice", true),
                menu("Coconut Kesari", "Semolina sweet with coconut.", "dessert", 99, "Desserts", true),
                menu("Banana Chips", "Kerala-style fried chips.", "snack", 69, "Sides", true)
        );
    }

    private List<MenuSeed> asianMenu() {
        return List.of(
                menu("Korean Chicken Rice Bowl", "Sticky glazed chicken over rice.", "bowl", 279, "Bowls", false),
                menu("Teriyaki Paneer Bowl", "Paneer, sesame vegetables, and rice.", "bowl", 249, "Bowls", true),
                menu("Chilli Garlic Noodles", "Wok-tossed noodles with chilli oil.", "noodles", 219, "Noodles", true),
                menu("Crispy Chicken Bao", "Two bao buns with spicy chicken.", "bao", 229, "Small Plates", false),
                menu("Crispy Tofu Bites", "Fried tofu with soy dip.", "tofu", 189, "Small Plates", true),
                menu("Burnt Garlic Fried Rice", "Wok-fried rice with garlic notes.", "rice", 199, "Rice", true),
                menu("Chilli Chicken Bowl", "Indo-Chinese comfort bowl.", "bowl", 269, "Bowls", false),
                menu("Sesame Veg Dumplings", "Steamed dumplings with chilli dip.", "dumpling", 179, "Small Plates", true),
                menu("Iced Matcha Lemonade", "Citrus green tea cooler.", "drink", 109, "Beverages", true),
                menu("Miso Caramel Pudding", "Soft-set caramel pudding.", "dessert", 129, "Desserts", true),
                menu("Spicy Edamame", "Salted and spiced edamame.", "edamame", 129, "Sides", true),
                menu("Chicken Katsu Wrap", "Crisp cutlet wrap with slaw.", "wrap", 239, "Wraps", false)
        );
    }

    private List<MenuSeed> bengaliMenu() {
        return List.of(
                menu("Kosha Mangsho Meal", "Slow-braised mutton with luchi or rice.", "bengali", 389, "Mains", false),
                menu("Bhetki Fry", "Golden fish fry with kasundi.", "fish-fry", 279, "Starters", false),
                menu("Basanti Pulao", "Sweet saffron rice with nuts.", "rice", 219, "Rice", true),
                menu("Chingri Malai Curry", "Prawn curry in coconut cream.", "curry", 369, "Curries", false),
                menu("Shukto", "Bengali bitter-sweet mixed vegetable stew.", "veg-side", 169, "Sides", true),
                menu("Luchi", "Soft puffed Bengali bread.", "bread", 79, "Breads", true),
                menu("Mochar Chop", "Banana flower croquettes.", "snack", 149, "Starters", true),
                menu("Daab Chingri", "Prawns baked in tender coconut.", "curry", 399, "Curries", false),
                menu("Mishti Doi Tub", "Classic sweet yoghurt.", "dessert", 129, "Desserts", true),
                menu("Nolen Gur Cheesecake Jar", "Winter jaggery dessert jar.", "dessert", 189, "Desserts", true),
                menu("Aam Pora Sherbet", "Smoky green mango cooler.", "drink", 89, "Beverages", true),
                menu("Veg Cutlet", "Bengali beetroot cutlet.", "snack", 109, "Starters", true)
        );
    }

    private List<MenuSeed> grillMenu() {
        return List.of(
                menu("Chicken Seekh Platter", "Skewers with onion salad and mint dip.", "kebab", 329, "Starters", false),
                menu("Hariyali Chicken", "Herb-marinated chargrilled chicken.", "grill", 319, "Starters", false),
                menu("Paneer Malai Tikka", "Creamy paneer skewers.", "paneer", 279, "Starters", true),
                menu("Butter Chicken Bowl", "Boneless butter chicken with rice.", "bowl", 329, "Mains", false),
                menu("Dal Bukhara", "Black lentils finished on charcoal heat.", "dal", 249, "Curries", true),
                menu("Garlic Naan", "Tandoor naan with garlic.", "bread", 69, "Breads", true),
                menu("Tandoori Broccoli", "Charred broccoli florets.", "veg-side", 189, "Starters", true),
                menu("Mutton Sheekh Roll", "Skewer wrapped in roomali.", "roll", 219, "Rolls", false),
                menu("Tandoori Pineapple", "Sweet-savoury grilled pineapple.", "dessert", 99, "Sides", true),
                menu("Masala Cola", "Spiced cola cooler.", "drink", 79, "Beverages", true),
                menu("Tawa Veg Platter", "Mixed veg tawa sampler.", "veg-side", 229, "Mains", true),
                menu("Kulfi Stick", "Chilled malai kulfi.", "dessert", 89, "Desserts", true)
        );
    }

    private List<MenuSeed> chaatMenu() {
        return List.of(
                menu("Tok Jhal Phuchka Kit", "Crunchy phuchka with tangy pani.", "chaat", 129, "Chaat", true),
                menu("Dahi Papdi Chaat", "Yoghurt, papdi, chutneys, and sev.", "chaat", 149, "Chaat", true),
                menu("Aloo Tikki Chaat", "Crisp potato patties with chutneys.", "chaat", 149, "Chaat", true),
                menu("Masala Kulcha Plate", "Stuffed kulcha with matar filling.", "kulcha", 169, "Snacks", true),
                menu("Paneer Tikka Wrap", "Quick wrap with mint mayo.", "wrap", 179, "Wraps", true),
                menu("Cheese Corn Balls", "Crunchy cheese-filled bites.", "snack", 159, "Snacks", true),
                menu("Chilli Potato", "Indo-Chinese style potato fingers.", "fries", 149, "Snacks", true),
                menu("Rose Lassi", "Sweet rose yoghurt drink.", "drink", 89, "Beverages", true),
                menu("Salted Lemon Soda", "Fizzed lemon refresher.", "drink", 69, "Beverages", true),
                menu("Rabri Cup", "Mini dessert cup.", "dessert", 99, "Desserts", true),
                menu("Veg Cheese Sandwich", "Grilled sandwich with masala filling.", "sandwich", 139, "Snacks", true),
                menu("Jhalmuri Tub", "Mustard-oil tossed puffed rice mix.", "snack", 89, "Snacks", true)
        );
    }

    private List<MenuSeed> dessertMenu() {
        return List.of(
                menu("Baked Rosogolla Tin", "Caramelised rosogolla baked with cream.", "dessert", 299, "Desserts", true),
                menu("Nolen Gur Cheesecake Jar", "Jaggery cheesecake in a jar.", "dessert", 189, "Desserts", true),
                menu("Mishti Doi Tub", "Classic Bengali sweet yoghurt.", "dessert", 129, "Desserts", true),
                menu("Rabri Jalebi Combo", "Hot jalebi with chilled rabri.", "dessert", 219, "Desserts", true),
                menu("Kesar Rasmalai Box", "Four-piece rasmalai box.", "dessert", 249, "Desserts", true),
                menu("Malai Kulfi Slice", "Creamy kulfi slab.", "dessert", 109, "Desserts", true),
                menu("Motichoor Ladoo Box", "Festive ladoo box.", "dessert", 199, "Mithai", true),
                menu("Chocolate Sandesh", "Fusion Bengali chocolate sandesh.", "dessert", 159, "Mithai", true),
                menu("Dry Fruit Chomchom", "Rich stuffed chomchom.", "dessert", 179, "Mithai", true),
                menu("Rose Milk", "Chilled rose milk bottle.", "drink", 89, "Beverages", true),
                menu("Kesar Badam Milk", "Saffron almond milk.", "drink", 99, "Beverages", true),
                menu("Mini Sweet Platter", "Curated six-piece assorted box.", "dessert", 349, "Mithai", true)
        );
    }

    private List<MenuSeed> mughlaiMenu() {
        return List.of(
                menu("Chicken Rezala", "Fragrant Kolkata-style rezala.", "mughlai", 349, "Curries", false),
                menu("Mutton Chaap", "Rich and slow-cooked Mughlai chaap.", "mughlai", 319, "Curries", false),
                menu("Chicken Chaap", "Creamy chaap with subtle sweetness.", "mughlai", 289, "Curries", false),
                menu("Rumali Roti", "Soft handkerchief bread.", "bread", 49, "Breads", true),
                menu("Mughlai Paratha", "Egg-filled flaky Mughlai paratha.", "paratha", 159, "Breads", false),
                menu("Paneer Rezala", "Vegetarian take on rezala gravy.", "curry", 259, "Curries", true),
                menu("Chicken Kabiraji", "Crispy Kolkata club-style cutlet.", "cutlet", 239, "Starters", false),
                menu("Mutton Korma", "Nutty classic korma.", "curry", 339, "Curries", false),
                menu("Firni Bowl", "Slow-set Mughlai dessert.", "dessert", 119, "Desserts", true),
                menu("Saffron Tea", "Light spiced tea.", "drink", 69, "Beverages", true),
                menu("Seekh Kebab", "Classic minced meat skewer.", "kebab", 259, "Starters", false),
                menu("Paneer Cutlet", "Crumb-fried paneer cutlet.", "paneer", 189, "Starters", true)
        );
    }

    private List<MenuSeed> healthyMenu() {
        return List.of(
                menu("Harissa Paneer Bowl", "Grains, greens, and harissa paneer.", "bowl", 249, "Bowls", true),
                menu("Lemon Herb Chicken Bowl", "Grilled chicken over herbed rice.", "bowl", 279, "Bowls", false),
                menu("Quinoa Chaat Salad", "Crunchy sweet-spicy quinoa salad.", "salad", 219, "Salads", true),
                menu("Mediterranean Wrap", "Falafel, hummus, and slaw wrap.", "wrap", 229, "Wraps", true),
                menu("Chicken Caesar Wrap", "Grilled chicken wrap with crisp lettuce.", "wrap", 249, "Wraps", false),
                menu("Cottage Cheese Steak", "Herb grilled paneer and sauteed veg.", "paneer", 269, "Mains", true),
                menu("Roasted Veg Soup", "Silky roasted vegetable soup.", "soup", 149, "Soups", true),
                menu("Greek Yoghurt Parfait", "Fruit and granola parfait.", "dessert", 139, "Desserts", true),
                menu("Cold Pressed Orange", "Fresh orange juice.", "drink", 109, "Beverages", true),
                menu("Green Detox Cooler", "Mint, cucumber, and lime cooler.", "drink", 99, "Beverages", true),
                menu("Protein Brownie", "High-protein chocolate square.", "dessert", 119, "Desserts", true),
                menu("Sweet Potato Fries", "Baked sweet potato fries.", "fries", 139, "Sides", true)
        );
    }

    private List<MenuSeed> chineseMenu() {
        return List.of(
                menu("Hakka Noodles", "Classic Indo-Chinese hakka noodles.", "noodles", 229, "Noodles", true),
                menu("Chilli Chicken", "Crispy chicken in chilli gravy.", "chilli-chicken", 269, "Mains", false),
                menu("Veg Fried Rice", "Wok-tossed fried rice.", "rice", 209, "Rice", true),
                menu("Chicken Fried Rice", "Smoky chicken fried rice.", "rice", 239, "Rice", false),
                menu("Crispy Chilli Babycorn", "Crunchy babycorn with chilli glaze.", "veg-side", 199, "Starters", true),
                menu("Chicken Manchurian", "Indo-Chinese chicken Manchurian.", "curry", 259, "Mains", false),
                menu("Veg Spring Rolls", "Crunchy vegetable spring rolls.", "roll", 169, "Starters", true),
                menu("Schezwan Paneer", "Paneer tossed in schezwan sauce.", "paneer", 239, "Mains", true),
                menu("Hot Garlic Sauce", "Extra side gravy.", "dip", 39, "Add-ons", true),
                menu("Sweet Corn Soup", "Restaurant-style sweet corn soup.", "soup", 119, "Soups", true),
                menu("Lemon Iced Tea", "Fresh brewed iced tea.", "drink", 89, "Beverages", true),
                menu("Honey Noodles Ice Cream", "Crunchy honey noodles dessert.", "dessert", 149, "Desserts", true)
        );
    }

    private MenuSeed menu(String name, String description, String imageKey, int price, String category, boolean veg) {
        return new MenuSeed(name, description, imageKey, price, category, veg);
    }

    private OrderLineSeed line(String name, int quantity, int price) {
        return new OrderLineSeed(name, quantity, price);
    }

    private String slugify(String value) {
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private String categoryImageKey(String category) {
        String normalized = category.toLowerCase(Locale.ROOT);
        if (normalized.contains("dessert") || normalized.contains("mithai")) {
            return "desserts";
        }
        if (normalized.contains("beverage") || normalized.contains("drink") || normalized.contains("coffee")) {
            return "beverages";
        }
        if (normalized.contains("bread") || normalized.contains("roll") || normalized.contains("wrap")) {
            return "handhelds";
        }
        if (normalized.contains("starter") || normalized.contains("small") || normalized.contains("chaat")) {
            return "starters";
        }
        if (normalized.contains("rice") || normalized.contains("biryani") || normalized.contains("bowl")) {
            return "rice-bowl";
        }
        return "signature";
    }

    private record RestaurantSeed(
            String name,
            String locality,
            String cuisineType,
            String description,
            double rating,
            int deliveryTimeMinutes,
            int deliveryFee,
            String imageKey,
            String imageColor,
            List<MenuSeed> menu
    ) {
    }

    private record MenuSeed(
            String name,
            String description,
            String imageKey,
            int price,
            String category,
            boolean veg
    ) {
    }

    private record AddressSeed(
            String label,
            String address,
            String buildingInfo,
            String city,
            String phone,
            double latitude,
            double longitude,
            boolean isDefault
    ) {
    }

    private record OrderLineSeed(String name, int quantity, int price) {
    }

    private record DeliveryPartnerSeed(
            String email,
            String name,
            String phone,
            String vehicleType,
            String preferredShift,
            String serviceZones,
            String deliveryExperience,
            String avatarUrl
    ) {
    }

    private record CouponSeed(
            String code,
            String title,
            String description,
            int discountAmount,
            int minOrderAmount,
            boolean enabled
    ) {
    }

    private DeliveryPartnerSeed deliveryPartner(
            String email,
            String name,
            String phone,
            String vehicleType,
            String preferredShift,
            String serviceZones,
            String deliveryExperience,
            String avatarUrl
    ) {
        return new DeliveryPartnerSeed(
                email,
                name,
                phone,
                vehicleType,
                preferredShift,
                serviceZones,
                deliveryExperience,
                avatarUrl
        );
    }
}
