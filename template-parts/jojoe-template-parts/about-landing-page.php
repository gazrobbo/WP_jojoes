<div id="about" class="layout-center-content divider mb-0">
	<div class="container about-container">

		<div class="section1">
			<h2>Why choose us?</h2>
			<p>We are one of the top dog groomers in Hull,
				Beverley and the East Riding of Yorkshire,
				a family-run team who all share a passion for dogs. Catering for 
				
				<!-- large dog breed title for landing pages -->
				<?php 
				$content = get_field('dog_breed_large');
				?>
				<?php if ($content):?>
				<span id="large-breed-title"><?php the_field('dog_breed_large')?>'s</span>
				<?php endif; ?>
				<!-- small dog breed title for landing pages -->
				<?php 
				$content = get_field('dog_breed_small');
				?>
				<?php if ($content):?>
				<span id="small-breed-title"><?php the_field('dog_breed_small')?>'s</span>
				<?php endif; ?>
				 at competitive prices and provide a
				safe
				and stress-free environment for all the 
				
				<!-- large dog breed title for landing pages -->
				<?php 
				$content = get_field('dog_breed_large');
				?>
				<?php if ($content):?>
				<span id="large-breed-title"><?php the_field('dog_breed_large')?>'s</span>
				<?php endif; ?>
				<!-- small dog breed title for landing pages -->
				<?php 
				$content = get_field('dog_breed_small');
				?>
				<?php if ($content):?>
				<span id="small-breed-title"><?php the_field('dog_breed_small')?>'s</span>
				<?php endif; ?>
				
				 that visit us </p>
		</div>

		<div class="section2">
			<h3>Dog lovers</h3>
			<P>Our team are all dog owners and truly love animals that is why we have chosen this career. Your

				<!-- large dog breed title for landing pages -->
				<?php 
				$content = get_field('dog_breed_large');
				?>
				<?php if ($content):?>
				<span id="large-breed-title"><?php the_field('dog_breed_large')?>'s</span>
				<?php endif; ?>
				<!-- small dog breed title for landing pages -->
				<?php 
				$content = get_field('dog_breed_small');
				?>
				<?php if ($content):?>
				<span id="small-breed-title"><?php the_field('dog_breed_small')?>'s</span>
				<?php endif; ?>
				
				wellbeing is our priority. We only accept a limited number of dogs per day this allows us to
				spend time with your dog. We try
				and keep your dogs time here short and sweet as we know they want to get back to there owners.
			</P>
			<h3>Professional dog groomers</h3>
			<P>We have a team of trained and caring professional groomers. Our team maintains the highest standards of hygiene
				and
				we use the latest equipment for our grooming services. </P>
			<h3>A friendly team</h3>
			<P>Our team are well trained,
				professional,
				welcoming and friendly;
				we focus on delivering exceptional customer satisfaction </P>
		</div>

		<a href="#contact" class="btn-norm btn-white">book now</a>

	</div>
</div>
