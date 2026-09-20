import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  runApp(const MvsElectricalApp());
}

class MvsElectricalApp extends StatelessWidget {
  const MvsElectricalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'MVS Electrical',
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF5F7FA),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF14213D),
        ),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        centerTitle: true,
        title: const Column(
          children: [
            Text(
              '⚡ MVS ELECTRICAL',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF14213D),
              ),
            ),
            Text(
              'Electrical & Plumbing',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              _menuCard(
                context,
                icon: Icons.bolt,
                title: 'ELECTRICAL',
                subtitle: 'New Electrical Order',
                iconColor: Colors.orange,
                backgroundColor: const Color(0xFFFFF8E1),
                type: 'electrical',
              ),
              const SizedBox(height: 14),

              _menuCard(
                context,
                icon: Icons.plumbing,
                title: 'PLUMBING',
                subtitle: 'New Plumbing Order',
                iconColor: Colors.blue,
                backgroundColor: const Color(0xFFE8F4FF),
                type: 'plumbing',
              ),
              const SizedBox(height: 14),

              _menuCard(
                context,
                icon: Icons.home,
                title: 'HOME PLANNING',
                subtitle: 'Rooms • Points • MCB',
                iconColor: Colors.green,
                backgroundColor: const Color(0xFFEFF8EF),
                type: 'planning',
              ),
              const SizedBox(height: 14),

              _menuCard(
                context,
                icon: Icons.folder,
                title: 'SAVED ORDERS',
                subtitle: 'View previous orders',
                iconColor: Colors.deepPurple,
                backgroundColor: const Color(0xFFF4EEFF),
                type: 'history',
              ),
              const SizedBox(height: 20),

              Container(
                padding: const EdgeInsets.symmetric(
                  vertical: 20,
                  horizontal: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _StatItem(title: 'Orders', value: '0'),
                    _StatItem(title: 'Customers', value: '0'),
                    _StatItem(title: 'Today', value: '0'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          if (index == 1) {
            openForm(context, 'electrical');
          } else if (index == 2) {
            openForm(context, 'plumbing');
          } else if (index == 3) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Saved Orders screen will be added next'),
              ),
            );
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bolt),
            label: 'Electrical',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.plumbing),
            label: 'Plumbing',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.folder),
            label: 'History',
          ),
        ],
      ),
    );
  }

  static Widget _menuCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required Color backgroundColor,
    required String type,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: () {
        openForm(context, type);
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: iconColor.withValues(alpha: 0.20),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 54,
              height: 54,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
              ),
              child: Icon(
                icon,
                color: iconColor,
                size: 30,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: iconColor,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 13,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: Colors.black45,
            ),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String title;
  final String value;

  const _StatItem({
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Color(0xFF14213D),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }
}

Future<void> openForm(
  BuildContext context,
  String type,
) async {
  if (type == 'electrical') {
    final prefs = await SharedPreferences.getInstance();

    final number =
        (prefs.getInt('mvsElectricalOrderNo') ?? 1000) + 1;

    await prefs.setInt(
      'mvsElectricalOrderNo',
      number,
    );

    final orderNo = 'MVS-E$number';

    if (!context.mounted) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ElectricalOrderPage(
          orderNo: orderNo,
        ),
      ),
    );
    return;
  }

  if (type == 'plumbing') {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Plumbing screen will be connected next'),
      ),
    );
    return;
  }

  if (type == 'planning') {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Home Planning screen will be connected next'),
      ),
    );
    return;
  }

  if (type == 'history') {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Saved Orders screen will be connected next'),
      ),
    );
  }
}

class ElectricalOrderPage extends StatefulWidget {
  final String orderNo;

  const ElectricalOrderPage({
    super.key,
    required this.orderNo,
  });

  @override
  State<ElectricalOrderPage> createState() =>
      _ElectricalOrderPageState();
}

class _ElectricalOrderPageState
    extends State<ElectricalOrderPage> {
  static const String electricalUrl =
      'https://mvs-thamizharasu.github.io/'
      'electrical-plumbing/shared/data/electrical.json';

  final TextEditingController customerController =
      TextEditingController();

  final TextEditingController phoneController =
      TextEditingController();

  final TextEditingController searchController =
      TextEditingController();

  DateTime selectedDate = DateTime.now();

  bool selectedOnly = false;
  bool loading = true;

  String? errorMessage;

  List<dynamic> items = [];
  final Map<int, int> quantities = {};

  @override
  void initState() {
    super.initState();
    loadElectricalItems();
  }

  @override
  void dispose() {
    customerController.dispose();
    phoneController.dispose();
    searchController.dispose();
    super.dispose();
  }

  Future<void> loadElectricalItems() async {
    try {
      setState(() {
        loading = true;
        errorMessage = null;
      });

      final response = await http.get(
        Uri.parse(electricalUrl),
      );

      if (response.statusCode != 200) {
        throw Exception(
          'HTTP ${response.statusCode}',
        );
      }

      final decoded =
          jsonDecode(utf8.decode(response.bodyBytes));

      final List<dynamic> loadedItems =
          decoded['items'] is List
              ? decoded['items']
              : [];

      if (!mounted) return;

      setState(() {
        items = loadedItems;
        loading = false;
      });
    } catch (error) {
      if (!mounted) return;

      setState(() {
        loading = false;
        errorMessage =
            'Electrical items load ஆகவில்லை.\n$error';
      });
    }
  }

  Future<void> chooseDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );

    if (picked != null) {
      setState(() {
        selectedDate = picked;
      });
    }
  }

  String get formattedDate {
    final d =
        selectedDate.day.toString().padLeft(2, '0');
    final m =
        selectedDate.month.toString().padLeft(2, '0');

    return '${selectedDate.year}-$m-$d';
  }

  void clearAll() {
    setState(() {
      quantities.clear();
      selectedOnly = false;
      searchController.clear();
    });
  }

  int get totalQuantity {
    int total = 0;

    for (final quantity in quantities.values) {
      total += quantity;
    }

    return total;
  }

  List<dynamic> get filteredItems {
    final search =
        searchController.text.trim().toLowerCase();

    return items.asMap().entries
        .where((entry) {
          final index = entry.key;
          final item = entry.value;

          final name =
              item['name']?.toString().toLowerCase() ?? '';

          final matchesSearch =
              search.isEmpty || name.contains(search);

          final matchesSelected =
              !selectedOnly ||
              (quantities[index] ?? 0) > 0;

          return matchesSearch && matchesSelected;
        })
        .map((entry) => entry.value)
        .toList();
  }

  void increaseQuantity(int originalIndex) {
    setState(() {
      quantities[originalIndex] =
          (quantities[originalIndex] ?? 0) + 1;
    });
  }

  void decreaseQuantity(int originalIndex) {
    final current =
        quantities[originalIndex] ?? 0;

    setState(() {
      if (current <= 1) {
        quantities.remove(originalIndex);
      } else {
        quantities[originalIndex] = current - 1;
      }
    });
  }

  int getItemOriginalIndex(dynamic item) {
    return items.indexOf(item);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'MVS ELECTRICAL',
          style: TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              _buildHeader(),
              const SizedBox(height: 12),
              _buildSearchTools(),
              const SizedBox(height: 12),
              _buildItems(),
              const SizedBox(height: 12),
              _buildTotal(),
              const SizedBox(height: 16),
              _buildActionButtons(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'MVS ELECTRICAL',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Thamizharasu • +91 6383754237',
            style: TextStyle(
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Order No: ${widget.orderNo}',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          TextField(
            controller: customerController,
            decoration: const InputDecoration(
              labelText: 'Customer',
              hintText: 'Customer Name',
              prefixIcon: Icon(Icons.person),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),

          TextField(
            controller: phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Phone',
              hintText: 'Phone Number',
              prefixIcon: Icon(Icons.phone),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),

          InkWell(
            onTap: chooseDate,
            child: InputDecorator(
              decoration: const InputDecoration(
                labelText: 'Date',
                prefixIcon: Icon(
                  Icons.calendar_today,
                ),
                border: OutlineInputBorder(),
              ),
              child: Text(formattedDate),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchTools() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          TextField(
            controller: searchController,
            onChanged: (_) {
              setState(() {});
            },
            decoration: const InputDecoration(
              hintText:
                  '🔍 Search electrical items...',
              prefixIcon: Icon(Icons.search),
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 8),

          Row(
            children: [
              Checkbox(
                value: selectedOnly,
                onChanged: (value) {
                  setState(() {
                    selectedOnly = value ?? false;
                  });
                },
              ),
              const Expanded(
                child: Text(
                  'Show Selected Only',
                ),
              ),
              TextButton.icon(
                onPressed: clearAll,
                icon: const Icon(Icons.refresh),
                label: const Text('Clear All'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildItems() {
    if (loading) {
      return const Padding(
        padding: EdgeInsets.all(40),
        child: CircularProgressIndicator(),
      );
    }

    if (errorMessage != null) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 40,
            ),
            const SizedBox(height: 10),
            Text(
              errorMessage!,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: loadElectricalItems,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    final visibleItems = filteredItems;

    if (visibleItems.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(30),
        child: Text(
          'No electrical items found',
        ),
      );
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFFEFF2F6),
              borderRadius: BorderRadius.vertical(
                top: Radius.circular(16),
              ),
            ),
            child: const Row(
              children: [
                SizedBox(
                  width: 45,
                  child: Text(
                    'S.No.',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Expanded(
                  child: Text(
                    'PARTICULARS',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                SizedBox(
                  width: 75,
                  child: Text(
                    'Qty.',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          ListView.separated(
            shrinkWrap: true,
            physics:
                const NeverScrollableScrollPhysics(),
            itemCount: visibleItems.length,
            separatorBuilder: (_, _) =>
                const Divider(height: 1),
            itemBuilder: (context, index) {
              final item = visibleItems[index];
              final originalIndex =
                  getItemOriginalIndex(item);

              final name =
                  item['name']?.toString() ?? 'Item';

              final quantity =
                  quantities[originalIndex] ?? 0;

              return Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 10,
                ),
                child: Row(
                  crossAxisAlignment:
                      CrossAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 35,
                      child: Text(
                        '${index + 1}',
                      ),
                    ),
                    Expanded(
                      child: Text(
                        name,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          onPressed: quantity > 0
                              ? () {
                                  decreaseQuantity(
                                    originalIndex,
                                  );
                                }
                              : null,
                          icon: const Icon(
                            Icons.remove_circle_outline,
                          ),
                        ),
                        Text(
                          '$quantity',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            increaseQuantity(
                              originalIndex,
                            );
                          },
                          icon: const Icon(
                            Icons.add_circle_outline,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildTotal() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 18,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const Expanded(
            child: Text(
              'TOTAL',
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Text(
            '$totalQuantity',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                },
                icon: const Icon(
                  Icons.arrow_back,
                ),
                label: const Text('Back'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context)
                      .showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Save feature will be connected next',
                      ),
                    ),
                  );
                },
                icon: const Icon(Icons.save),
                label: const Text('Save'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context)
                      .showSnackBar(
                    const SnackBar(
                      content: Text(
                        'PDF feature will be connected next',
                      ),
                    ),
                  );
                },
                icon: const Icon(
                  Icons.picture_as_pdf,
                ),
                label: const Text('PDF'),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context)
                      .showSnackBar(
                    const SnackBar(
                      content: Text(
                        'WhatsApp feature will be connected next',
                      ),
                    ),
                  );
                },
                icon: const Icon(Icons.chat),
                label: const Text('WhatsApp'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),

      // =========================
      // TOP APP BAR
      // =========================
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Column(
          children: [
            Text(
              '⚡ MVS ELECTRICAL',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Color(0xFF14213D),
              ),
            ),
            SizedBox(height: 2),
            Text(
              'Electrical & Plumbing',
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),

      // =========================
      // BODY
      // =========================
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(14, 14, 14, 20),
          child: Column(
            children: [

              // ELECTRICAL
              _menuCard(
                context,
                icon: Icons.bolt_rounded,
                title: 'ELECTRICAL',
                subtitle: 'New Electrical Order',
                iconColor: const Color(0xFFFF9800),
                backgroundColor: const Color(0xFFFFF7DD),
                type: 'electrical',
              ),

              const SizedBox(height: 12),

              // PLUMBING
              _menuCard(
                context,
                icon: Icons.plumbing_rounded,
                title: 'PLUMBING',
                subtitle: 'New Plumbing Order',
                iconColor: const Color(0xFF2196F3),
                backgroundColor: const Color(0xFFEAF5FF),
                type: 'plumbing',
              ),

              const SizedBox(height: 12),

              // HOME PLANNING
              _menuCard(
                context,
                icon: Icons.home_rounded,
                title: 'HOME PLANNING',
                subtitle: 'Rooms • Points • MCB',
                iconColor: const Color(0xFF22A447),
                backgroundColor: const Color(0xFFEBF8EE),
                type: 'planning',
              ),

              const SizedBox(height: 12),

              // SAVED ORDERS
              _menuCard(
                context,
                icon: Icons.folder_rounded,
                title: 'SAVED ORDERS',
                subtitle: 'View previous orders',
                iconColor: const Color(0xFF6C3FD9),
                backgroundColor: const Color(0xFFF2ECFF),
                type: 'history',
              ),

              const SizedBox(height: 18),

              // =========================
              // STATS
              // =========================
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  vertical: 18,
                  horizontal: 10,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _StatItem(
                      title: 'Orders',
                      value: '0',
                    ),
                    _StatItem(
                      title: 'Customers',
                      value: '0',
                    ),
                    _StatItem(
                      title: 'Today',
                      value: '0',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              const Text(
                'Simple Orders. Stronger Relationships.',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),

      // =========================
      // BOTTOM NAVIGATION
      // =========================
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 10,

        selectedItemColor: const Color(0xFF14213D),
        unselectedItemColor: Colors.grey,

        onTap: (index) {
          switch (index) {
            case 0:
              break;

            case 1:
              openForm(context, 'electrical');
              break;

            case 2:
              openForm(context, 'plumbing');
              break;

            case 3:
              openForm(context, 'history');
              break;
          }
        },

        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bolt_rounded),
            label: 'Electrical',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.plumbing_rounded),
            label: 'Plumbing',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.folder_rounded),
            label: 'History',
          ),
        ],
      ),
    );
  }

  // =========================
  // MENU CARD
  // =========================
  static Widget _menuCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required Color backgroundColor,
    required String type,
  }) {
    return InkWell(
      borderRadius: BorderRadius.circular(20),

      onTap: () {
        openForm(context, type);
      },

      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),

        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: iconColor.withValues(alpha: 0.18),
          ),
        ),

        child: Row(
          children: [

            // ICON
            Container(
              width: 56,
              height: 56,

              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(17),
              ),

              child: Icon(
                icon,
                color: iconColor,
                size: 30,
              ),
            ),

            const SizedBox(width: 14),

            // TEXT
            Expanded(
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [

                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: iconColor,
                    ),
                  ),

                  const SizedBox(height: 5),

                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.black54,
                    ),
                  ),
                ],
              ),
            ),

            // ARROW
            Container(
              width: 34,
              height: 34,

              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.75),
                shape: BoxShape.circle,
              ),

              child: const Icon(
                Icons.chevron_right_rounded,
                color: Colors.black45,
              ),
            ),
          ],
        ),
      ),
    );
  }
}