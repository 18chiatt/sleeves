import React, { useState, useMemo, useDeferredValue, useCallback, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, ScrollView, BackHandler, Linking, StatusBar } from "react-native";
import {
	BottomNavigation,
	TextInput,
	Card,
	Appbar,
	Button,
	Badge,
	DefaultTheme,
	Provider,
	IconButton,
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GAMES, GAMES_ARR, SKUS, SKU_MAP } from "./constants";
import Icon from "react-native-paper/lib/typescript/src/components/Icon";

const BRAND_COLOR = "#762440";

const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: "#762440",
		accent: "#0A80DE",
	},
};

export default function App() {
	return (
		<SafeAreaProvider>
			<Provider theme={theme}>
				<StatusBar barStyle="dark-content" backgroundColor={BRAND_COLOR} translucent={true} />
				<MyComponent />
			</Provider>
		</SafeAreaProvider>
	);
}

function GamesWrapper() {
	return (
		<SafeAreaView>
			<Games />
		</SafeAreaView>
	);
}

function Games() {
	const [selectedId, setSelectedId] = useState<null | string>(null);
	const [query, setQuery] = useState("");
	const deferredQuery = useDeferredValue(query);

	useEffect(() => {
		const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
		const unsub = () => subscription.remove();
		return unsub;
	}, []);

	const filteredList = useMemo(() => {
		const deferedToLowercase = deferredQuery.toLowerCase();
		const filtered = GAMES_ARR.filter((item) => item[0].nameLower.includes(deferedToLowercase));
		return filtered.sort(
			(a, b) => a[0].nameLower.indexOf(deferedToLowercase) - b[0].nameLower.indexOf(deferedToLowercase)
		);
	}, [deferredQuery]);
	const selected = selectedId && GAMES[selectedId];
	if (selectedId) {
		return (
			<Details
				selected={selected}
				goBack={() => {
					setSelectedId(null);
				}}
			/>
		);
	}

	return (
		<>
			<Appbar.Header style={{ marginTop: -20, backgroundColor: BRAND_COLOR }} dark={true}>
				<Appbar.Content title="Search Games" titleStyle={{ color: "white" }} />
			</Appbar.Header>
			<View style={{ margin: 20 }}>
				<TextInput mode="outlined" label="Search" value={query} onChangeText={(text) => setQuery(text)} />
				<FlatList
					data={filteredList}
					renderItem={({ item, index }) => (
						<GameEntry
							last={index === filteredList.length - 1}
							title={item[0].name}
							setId={setSelectedId}
							count={item.reduce((prev, curr) => prev + parseInt(curr.count, 10), 0)}
							distinctSizes={item.map((size) => size.sku)}
						/>
					)}
					keyExtractor={(item) => item[0].name}
				/>
			</View>
		</>
	);
}

function GameEntry(props) {
	const { title, setId, count, distinctSizes, last } = props;
	const validSizes = (distinctSizes as string[]).reduce((prev, curr) => (SKU_MAP.get(curr) ? prev + 1 : prev), 0);
	const invalidSizes = distinctSizes.length - validSizes;
	return (
		<Card
			style={{ marginTop: 10, marginHorizontal: 5, marginBottom: last ? 300 : 5 }}
			onPress={() => setId(title)}
			elevation={2}
		>
			<Card.Title title={title} titleNumberOfLines={3} subtitle={`Total Cards: ${count}`} />
		</Card>
	);
}

function Details(props) {
	const { goBack, selected } = props;
	const name = selected[0].name;
	const displayOrder = [...selected].sort((a, b) => (SKU_MAP.get(a.sku) ? -1 : 1));
	useEffect(() => {
		const subscription = BackHandler.addEventListener("hardwareBackPress", goBack);
		const unsub = () => subscription.remove();
		return unsub;
	}, [goBack]);

	return (
		<View style={{ maxHeight: "100%" }}>
			<Appbar.Header dark style={{ backgroundColor: BRAND_COLOR, marginTop: -20 }}>
				<Appbar.BackAction onPress={() => goBack()} iconColor="white" />
				<Appbar.Content title="Game Details" titleStyle={{ color: "white" }} />
			</Appbar.Header>
			<View style={{ padding: 20 }}>
				<Text style={{ fontSize: 25, fontWeight: "bold" }}>{name}</Text>

				<ScrollView style={{ maxHeight: "100%" }}>
					{displayOrder.map((item, index) => (
						<SizeDisplay
							size={item}
							last={index === displayOrder.length - 1}
							key={`${item.sku}${item.width}${item.height}`}
						/>
					))}
				</ScrollView>
			</View>
		</View>
	);
	return;
}

function SizeDisplay(props) {
	const { size, last } = props;
	const { sku, height, width, count } = size;
	const skuDetails = SKU_MAP.get(sku) || { name: `Unknown Sku`, link: null };

	return <SizeCard skuDetails={skuDetails} height={height} width={width} count={count} last={last} />;
}

function SizeCard(props) {
	const { skuDetails, count, width, height, last } = props;
	return (
		<View style={{ marginTop: 10, marginHorizontal: 2, paddingBottom: 10, marginBottom: last ? 600 : 0 }}>
			<Card key={skuDetails.name}>
				<Card.Title title={skuDetails.name} subtitle={count ? `Count: ${count}` : undefined} />
				<Card.Content>
					<Text>Width: {width || skuDetails.width}</Text>
					<Text>Height: {height || skuDetails.height}</Text>
				</Card.Content>
				<Card.Actions>
					{skuDetails?.premiumLink && (
						<Button icon="open-in-new" mode="contained-tonal" onPress={() => Linking.openURL(skuDetails.premiumLink)}>
							Buy Premium
						</Button>
					)}
					{skuDetails.link ? (
						<Button icon="open-in-new" onPress={() => Linking.openURL(skuDetails.link)}>
							Buy Now
						</Button>
					) : (
						<Button disabled>unavailable</Button>
					)}
				</Card.Actions>
			</Card>
		</View>
	);
}

function Sleeves() {
	const [query, setQuery] = useState("");
	const filtered = SKUS.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
	useEffect(() => {
		const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
		const unsub = () => subscription.remove();
		return unsub;
	}, []);
	return (
		<SafeAreaView>
			<Appbar.Header style={{ marginTop: -20, backgroundColor: BRAND_COLOR }} dark={true}>
				<Appbar.Content title="Sleeve Sizes" titleStyle={{ color: "white" }} />
			</Appbar.Header>
			<View style={{ margin: 20 }}>
				<View style={{ marginBottom: 5 }}>
					<TextInput mode="outlined" label="Search" onChangeText={(text) => setQuery(text.toLowerCase())} />
				</View>
				<FlatList
					data={filtered}
					renderItem={({ item, index }) => <SizeCard skuDetails={item} last={index === filtered.length - 1} />}
					keyExtractor={(item) => item.sku}
				/>
			</View>
		</SafeAreaView>
	);
}

const MyComponent = () => {
	const [index, setIndex] = React.useState(0);
	const [routes] = React.useState([
		{ key: "games", title: "Games", focusedIcon: "chess-pawn" },
		{ key: "sleeves", title: "Sleeves", focusedIcon: "cards-outline" },
	]);

	const renderScene = BottomNavigation.SceneMap({
		games: GamesWrapper,
		sleeves: Sleeves,
	});

	return (
		<BottomNavigation
			navigationState={{ index, routes }}
			onIndexChange={setIndex}
			renderScene={renderScene}
			barStyle={{ borderColor: BRAND_COLOR, borderWidth: 2, borderBottomWidth: 0 }}
		/>
	);
};
