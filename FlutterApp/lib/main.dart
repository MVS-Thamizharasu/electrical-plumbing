import 'package:flutter/material.dart';
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
        fontFamily: 'Arial',
        scaffoldBackgroundColor: const Color(0xFFF5F7FA),
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
        title: Column(
          children: const [
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
              style: TextStyle(fontSize: 12, color: Colors.grey),
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
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: const [
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
        onTap: (index) {},
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.bolt), label: 'Electrical'),
          BottomNavigationBarItem(
            icon: Icon(Icons.plumbing),
            label: 'Plumbing',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.folder), label: 'History'),
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
      onTap: () => openForm(context, type),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: iconColor.withValues(alpha: 0.20)),
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
              child: Icon(icon, color: iconColor, size: 30),
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
                    style: const TextStyle(fontSize: 13, color: Colors.black54),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.black45),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String title;
  final String value;

  const _StatItem({required this.title, required this.value});

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
        Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}

Future<void> openForm(BuildContext context, String type) async {
  final prefs = await SharedPreferences.getInstance();

  if (type == 'electrical') {
    final number = (prefs.getInt('mvsElectricalOrderNo') ?? 1000) + 1;

    await prefs.setInt('mvsElectricalOrderNo', number);

    final orderNo = 'MVS-E$number';

    if (!context.mounted) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ElectricalOrderPage(orderNo: orderNo),
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

class _ElectricalOrderPageState extends State<ElectricalOrderPage> {
  final TextEditingController customerController =
      TextEditingController();

  final TextEditingController phoneController =
      TextEditingController();

  DateTime selectedDate = DateTime.now();

  @override
  void dispose() {
    customerController.dispose();
    phoneController.dispose();
    super.dispose();
  }

  String get formattedDate {
    final d = selectedDate.day.toString().padLeft(2, '0');
    final m = selectedDate.month.toString().padLeft(2, '0');
    return '${selectedDate.year}-$m-$d';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MVS ELECTRICAL'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              'Order No: ${widget.orderNo}',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            TextField(
              controller: customerController,
              decoration: const InputDecoration(
                labelText: 'Customer',
                hintText: 'Customer Name',
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
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 12),

            InkWell(
              onTap: chooseDate,
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date',
                  border: OutlineInputBorder(),
                ),
                child: Text(formattedDate),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Electrical items will be loaded from electrical.json',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}