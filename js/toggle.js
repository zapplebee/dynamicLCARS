var iteration=$(this).data('iteration')||1
			switch ( iteration) {
				case 1:
					alert("odd");
					break;
				
				case 2:
					alert("even");
					break;
			}
			iteration++;
			if (iteration>2) iteration=1
			$(this).data('iteration',iteration)